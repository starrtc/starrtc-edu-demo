import Nim from './actions/nim';
import Chatroom from './actions/chatroom';
import Netcall from './actions/room';
import WhiteBoard from './actions/whiteboard';
import EventPool from './actions/eventpool';

const StoreNim = window.SNM = new Nim();
const StoreChatroom = window.SCR = new Chatroom();
const StoreNetcall = window.SNC = new Netcall();
const StoreWhiteBoard = window.SWB = new WhiteBoard();
const StoreEventPool = window.SEP = new EventPool();

export { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard,StoreEventPool };
