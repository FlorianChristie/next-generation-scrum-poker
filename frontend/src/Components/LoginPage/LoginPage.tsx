import { RefObject } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import tngLogo from '../../img/tng.svg';
import { WebSocketApi } from '../../types/WebSocket';
import { connectToWebSocket } from '../WebSocket';
import { generateId } from './generateId';
import classes from './LoginPage.module.css';
import { TNG_URL } from '../../constants';

// During server-side-rendering, window/history cannot be accessed
const isSSR = typeof window === 'undefined';

const ProtoLoginPage = ({ socket }: { socket: WebSocketApi }) => {
  const firstInputRef: RefObject<HTMLInputElement> = useRef(null);
  const [user, setUser] = useState(socket.loginData.user);
  let sessionId = '';
  if (!isSSR) {
    sessionId = new URLSearchParams(window.location.search).get('sessionId') || '';
    if (!sessionId.match(/^[a-zA-Z0-9]{16}$/i)) {
      sessionId = generateId(16);
      history.replaceState({}, 'Scrum Poker', `?sessionId=${sessionId}`);
    }
  }

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  return (
    <form
      class={classes.loginPage}
      onSubmit={(event) => {
        event.preventDefault();
        socket.login(user, sessionId);
      }}
    >
      <div class={classes.heading}>
        NEXT GENERATION
        <br />
        SCRUM POKER
      </div>
      <label for="user" class={classes.userLabel}>
        Name:
      </label>
      <input
        id="user"
        type="text"
        value={user}
        ref={firstInputRef}
        class={classes.userInput}
        onInput={(event) => setUser((event.target as HTMLInputElement).value)}
      />
      <label for="session" class={classes.sessionLabel}>
        Session:
      </label>
      <a id="session" href={`?sessionId=${sessionId}`} class={classes.sessionLink}>
        {sessionId}
      </a>
      <input
        type="submit"
        value={socket.connected ? 'Login' : 'Connecting...'}
        class={classes.submit}
        disabled={user.length === 0 || !socket.connected}
      />
      <a href={TNG_URL} target="_blank" class={classes.logo}>
        <img src={tngLogo} alt="TNG Logo" class={classes.logoImage} />
      </a>
    </form>
  );
};

export const LoginPage = connectToWebSocket(ProtoLoginPage);
