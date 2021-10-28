import { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./styles.module.scss";

export const Account = () => {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");

  const history = useHistory();

  const handleJoinButton = () => {
    history.push(`/chat?room=${room}&username=${username}`);
  }

  return (
    <div className={styles.accountWrapper}>
      <div className={styles.accountDetailsContainer}>
        <label htmlFor="usernameInput">Username</label>
        <input id="usernameInput" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label htmlFor="roomInput">Room</label>
        <input id="roomInput" type="text" value={room} onChange={(e) => setRoom(e.target.value)} />

        <button onClick={handleJoinButton}>Join</button>
      </div>
    </div>
  );
}