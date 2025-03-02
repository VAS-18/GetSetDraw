import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

interface Player {
  id:string;
  ready:boolean;
  drawing:string | null;
  score: number;
}

interface Room {
  players: Player[];
  word: string;
  gameStarted: boolean;
  gameEnded: boolean;
}

const rooms: Record<string,Room> = {};

