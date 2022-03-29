import { broadcastState } from './broadcast-state';
import { CardValue, VOTE_NOTE_VOTED } from './shared/cards';
import { SCALES } from './shared/scales';
import { Config, ConfigWithHandler } from './sharedBackend/config';
import { getGroupItem } from './sharedBackend/getGroupItem';

const EXPIRY_TIME_IN_HOUR = process.env.EXPIRY_TIME_IN_HOUR || '16';

export const loginUser = async (userId: string, groupId: string, config: ConfigWithHandler) => {
  const groupItem = await getGroupItem(groupId, config);
  const groupUpdate = groupItem
    ? addUserToGroup(
        groupId,
        userId,
        groupItem.connections[userId]?.vote || VOTE_NOTE_VOTED,
        config
      )
    : createGroupWithUser(groupId, userId, config);
  await Promise.all([addUserAndGroupToConnection(groupId, userId, config), groupUpdate]);
  await broadcastState(groupId, config);
};

const addUserToGroup = (
  groupId: string,
  userId: string,
  vote: CardValue,
  { ddb, tableName, connectionId }: Config
) =>
  ddb
    .update({
      TableName: tableName,
      Key: {
        primaryKey: `groupId:${groupId}`,
      },
      UpdateExpression: `SET connections.#userId = :connection`,
      ExpressionAttributeNames: {
        '#userId': userId,
      },
      ExpressionAttributeValues: {
        ':connection': {
          connectionId,
          vote,
        },
      },
      ReturnValues: 'UPDATED_NEW',
    })
    .promise();

const createGroupWithUser = (
  groupId: string,
  userId: string,
  { ddb, tableName, connectionId }: Config
) =>
  ddb
    .put({
      TableName: tableName,
      Item: {
        primaryKey: `groupId:${groupId}`,
        ttl: Math.floor(Date.now() / 1000 + parseFloat(EXPIRY_TIME_IN_HOUR) * 60 * 60),
        connections: {
          [userId]: { connectionId: connectionId, vote: VOTE_NOTE_VOTED },
        },
        groupId,
        scale: SCALES.COHEN_SCALE.values,
      },
    })
    .promise();

const addUserAndGroupToConnection = (
  groupId: string,
  userId: string,
  { ddb, tableName, connectionId }: Config
) =>
  ddb
    .update({
      TableName: tableName,
      Key: {
        primaryKey: `connectionId:${connectionId}`,
      },
      UpdateExpression: 'set userId = :userId, groupId = :groupId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':groupId': groupId,
      },
      ReturnValues: 'UPDATED_NEW',
    })
    .promise();
