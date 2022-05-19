package handlers

import (
	"fmt"

	"github.com/anselbrandt/next-go-camera/client/utils"
	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/pion/webrtc/v3"
)

func Message(peerConnection *webrtc.PeerConnection, SUB_TOPIC string, PUB_TOPIC string) MQTT.MessageHandler {

	return func(client MQTT.Client, msg MQTT.Message) {
		if msg.Topic() == SUB_TOPIC {
			fmt.Println("offer received...")

			txt := string(msg.Payload())
			offer := webrtc.SessionDescription{}

			utils.Decode(txt, &offer)

			// Set the remote SessionDescription
			if err := peerConnection.SetRemoteDescription(offer); err != nil {
				panic(err)
			}

			// Create answer
			answer, err := peerConnection.CreateAnswer(nil)
			if err != nil {
				panic(err)
			}
			// Create channel that is blocked until ICE Gathering is complete
			gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

			// Sets the LocalDescription, and starts our UDP listeners
			if err = peerConnection.SetLocalDescription(answer); err != nil {
				panic(err)
			}

			// Block until ICE Gathering is complete, disabling trickle ICE
			// we do this because we only can exchange one signaling message
			// in a production application you should exchange ICE Candidates via OnICECandidate
			<-gatherComplete

			token := client.Publish(PUB_TOPIC, 0, false, utils.Encode(*peerConnection.LocalDescription()))
			token.Wait()

			fmt.Println("answer sent...")

		}
	}
}
