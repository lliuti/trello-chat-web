import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import { RiSendPlane2Fill, RiCloseFill } from "react-icons/ri";
import styles from "./styles.module.scss";
import { api } from "../../services/api";
import { ChatHeader } from "../../components/ChatHeader";
import { IMessage } from "../../interfaces/IMessage";
import { IBoard } from "../../interfaces/IBoard";
import { IList } from "../../interfaces/IList";

interface ILocationSearch {
  room?: string;
  username?: string;
}

const socket = io("http://localhost:3333");
socket.on("connect", () => {
  console.log("connected");
});


export const Chat = () => {
  // ROOM SETUP
  const [room, setRoom] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  // MESSAGING
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  // TRELLO
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [lists, setLists] = useState<IList[]>([]);
  const [cardTitle, setCardTitle] = useState("");

  // MODAL
  const [openedModal, setOpenedModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [step, setStep] = useState("getBoards");

  const history = useHistory();

  useEffect(() => {
    const { room, username } = queryString.parse(history.location.search) as ILocationSearch;

    setRoom(room);
    setUsername(username);
  }, [room, username])

  useEffect(() => {
    socket.on("new-message", (message: IMessage) => {
      setMessageList([...messageList, message])
    });
  }, [messageList])

  const handleSendMessage = async () => {
    const msg = message.trim();

    if (msg.length < 1) {
      return;
    }

    const messageObject = {
      message: msg,
      from: username
    }

    await api.post("/message", {
      messageObject
    });

    setMessage("");
  }

  const handleMessageClick = async (message) => {
    const response = await api.get<IBoard[]>("/boards");
    setCardTitle(message);
    setOpenedModal(true);
    setBoards(response.data)
    setModalTitle("Choose a Trello board");
  }

  const handleSelectBoard = async (boardId) => {
    const response = await api.get<IList[]>(`/boards/${boardId}/lists`);
    setLists(response.data);
    setStep("getLists");
    setModalTitle("Choose a list");
    return;
  }

  const handleCreateCard = async (list) => {
    if (cardTitle.length < 1) {
      return;
    }

    const cardDetails = { name: cardTitle, desc: `Created via Trello-Chat by: ${username}`, pos: "top", idList: list.id };
    await api.post("/cards", cardDetails);

    handleCloseModal();
  }

  const handleCloseModal = () => {
    setOpenedModal(false);
    setCardTitle("");
    setStep("getBoards");
  }

  return (
    <div className={styles.chatWrapper}>
      <ChatHeader />
      <div className={styles.messagesContainer}>
        <div className={openedModal ? styles.modal : styles.hidden}>
          <button onClick={handleCloseModal} className={styles.closeModalButton}><RiCloseFill size={24} /></button>
          <div className={styles.textBox}>
            <p>{modalTitle}</p>
          </div>
          <div className={step == "getBoards" ? styles.boardButtons : styles.hidden}>
            <div className={styles.buttons}>
              {boards.map((board) => {
                return (
                  <button onClick={() => handleSelectBoard(board.id)} key={board.id}>{board.name}</button>
                )
              })}
            </div>
          </div>
          <div className={step == "getLists" ? styles.listButtons : styles.hidden}>
            <div className={styles.buttons}>
              {lists.map((list) => {
                return (
                  <button onClick={() => handleCreateCard(list)} key={list.id}>{list.name}</button>
                )
              })}
            </div>
          </div>
        </div>

        {messageList.map((msg) => {
          return (
            <div key={msg.id} onClick={() => handleMessageClick(msg.message)} className={msg.from == username ? styles.messageSent : styles.messageReceived}>
              <div className={styles.messageText}>
                <p>{msg.message}</p>
                <span>{msg.from}</span>
              </div>
              <img className={styles.userImage} src="https://github.com/lliuti.png" alt="Profile picture" />
            </div>
          )
        })}
      </div>
      <div className={styles.inputContainer}>
        <input onChange={(e) => setMessage(e.target.value)} value={message} className={styles.messageInput} placeholder="Write a message here" />
        <button onClick={handleSendMessage} className={styles.sendMessageButton}>
          <RiSendPlane2Fill />
          Send
        </button>
      </div>
    </div>
  )
}