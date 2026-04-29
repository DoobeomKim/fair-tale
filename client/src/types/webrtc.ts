import { Instance } from 'simple-peer';

export interface WebRTCState {
  peer: Instance | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  data: any;
  from: string;
  to: string;
}

export interface PeerConfig {
  initiator: boolean;
  stream: MediaStream;
  trickle: boolean;
} 