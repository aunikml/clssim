import { Room, RoomEvent, createLocalAudioTrack } from 'livekit-client';
import { apiClient } from './apiClient';

class LiveKitService {
  constructor() {
    this.room = null;
    this.localAudioTrack = null;
    this.isConnected = false;
    this.listeners = new Set();
    this.activeSpeakers = new Set();
  }

  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    for (const cb of this.listeners) {
      cb({
        isConnected: this.isConnected,
        activeSpeakers: Array.from(this.activeSpeakers),
      });
    }
  }

  async fetchToken(sessionId) {
    try {
      const response = await apiClient.post(`/sessions/${sessionId}/livekit-token/`);
      return response.data;
    } catch (err) {
      console.warn('Could not fetch LiveKit token from backend; operating in local audio mode:', err);
      return null;
    }
  }

  async connect(sessionId) {
    if (this.isConnected) return;

    const tokenData = await this.fetchToken(sessionId);
    if (!tokenData || !tokenData.token || !tokenData.ws_url) {
      console.info('LiveKit credentials not configured; local spatial audio engine will handle room sound.');
      return;
    }

    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        this.activeSpeakers.clear();
        for (const speaker of speakers) {
          this.activeSpeakers.add(speaker.identity);
        }
        this.notify();
      });

      this.room.on(RoomEvent.Disconnected, () => {
        this.isConnected = false;
        this.activeSpeakers.clear();
        this.notify();
      });

      await this.room.connect(tokenData.ws_url, tokenData.token);
      this.isConnected = true;
      this.notify();
    } catch (err) {
      console.warn('LiveKit room connection error (fallback to local audio):', err);
      this.isConnected = false;
    }
  }

  async setMicrophoneEnabled(enabled) {
    if (!this.room || !this.isConnected) return false;

    try {
      if (enabled) {
        if (!this.localAudioTrack) {
          this.localAudioTrack = await createLocalAudioTrack({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          });
        }
        await this.room.localParticipant.publishTrack(this.localAudioTrack);
      } else {
        if (this.localAudioTrack) {
          await this.room.localParticipant.unpublishTrack(this.localAudioTrack);
          this.localAudioTrack.stop();
          this.localAudioTrack = null;
        }
      }
      return true;
    } catch (err) {
      console.warn('Failed to toggle microphone track:', err);
      return false;
    }
  }

  disconnect() {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    this.isConnected = false;
    this.activeSpeakers.clear();
    this.notify();
  }
}

export const livekitService = new LiveKitService();
