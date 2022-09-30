/*
mqtt.eclipseprojects.io

This is a public test MQTT broker service. It currently listens on the following ports:

1883 : MQTT over unencrypted TCP
8883 : MQTT over encrypted TCP
80 : MQTT over unencrypted WebSockets (note: URL must be /mqtt )
443 : MQTT over encrypted WebSockets (note: URL must be /mqtt )
*/

import mqtt from "mqtt";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { isBrowser } from "../utils";

const Home: NextPage = () => {
  const [bsd, setBsd] = useState<string>();
  const [gsd, setGsd] = useState<string>();
  const [status, setStatus] = useState<any>();
  const [peerConnection, setPeerConnection] = useState<any>();
  const [mqttConnected, setMqttConnected] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isBrowser) {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });
      setPeerConnection(pc);
    }
  }, []);

  useEffect(() => {
    if (isBrowser && peerConnection) {
      const pc = peerConnection;
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate === null) {
          const str = JSON.stringify(pc.localDescription);
          const base64str = Buffer.from(str, "utf-8").toString("base64");
          setBsd(base64str);
        }
      };
      pc.addTransceiver("video", { direction: "sendrecv" });
      pc.addTransceiver("audio", { direction: "sendrecv" });

      pc.createOffer()
        .then((d: RTCSessionDescriptionInit) => pc.setLocalDescription(d))
        .catch((error: any) => console.log(error));
    }
  }, [peerConnection]);

  useEffect(() => {
    if (isBrowser && peerConnection && ref.current) {
      const pc = peerConnection;

      pc.ontrack = function (event: RTCTrackEvent) {
        ref.current!.srcObject = event.streams[0];
        ref.current!.autoplay = true;
        ref.current!.controls = true;
      };
    }
  }, [peerConnection, gsd]);

  useEffect(() => {
    if (isBrowser && bsd) {
      const client = mqtt.connect("wss://test.mosquitto.org:8081");

      const handleConnect = () => {
        client.subscribe("webrtc/answer", handleSubscribe);
      };

      const handleSubscribe = (err: any) => {
        if (!err) {
          setMqttConnected(true);
          client.publish("webrtc/offer", bsd);
        }
      };

      const handleIncoming = (topic: any, message: any) => {
        const newMessage = message.toString();
        setGsd(newMessage);
      };

      client.on("connect", handleConnect);
      client.on("message", handleIncoming);
    }
  }, [bsd]);

  useEffect(() => {
    if (isBrowser && peerConnection && gsd) {
      const pc = peerConnection;
      pc.setRemoteDescription(
        new RTCSessionDescription(
          JSON.parse(Buffer.from(gsd, "base64").toString())
        )
      );
    }
  }, [peerConnection, gsd]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.description}>
          {mqttConnected && <div>mqtt connected...</div>}
          {bsd && <div>browser session description sent...</div>}
          {gsd && (
            <div style={{ marginBottom: "40px" }}>
              <div>client session description received...</div>
            </div>
          )}
          <video ref={ref} width={640} height={360} />
        </div>
      </main>
    </div>
  );
};

export default Home;
