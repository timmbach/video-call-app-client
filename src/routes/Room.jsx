import { useEffect, useRef } from "react";
import io from "socket.io-client";

function Room() {
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        userStream.current = stream;
        userVideo.current.srcObject = stream;
        // userVideo.current.play();
        socketRef.current = io.connect("/");
        socketRef.current.emit(
          "join room",
          {
            room: window.location.pathname.split("/")[2],
          }
          // props.match.params.roomId
        );

        socketRef.current.on("other user", (userId) => {
          callUser(userId);
          otherUser.current = userId;
        });

        socketRef.current.on("user joined", (userId) => {
          otherUser.current = userId;
        });

        socketRef.current.on("offer", handleReceiveCall);

        socketRef.current.on("answer", handleAnswer);

        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
      });
  }, []);

  const callUser = (userId) => {
    peerRef.current = createPeer(userId);
    userStream.current
      .getTracks()
      .forEach((track) => peerRef.current.addtrack(track, userStream.current));
  };

  const createPeer = (userId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userId);

    // (event) => {
    //   if (event.candidate) {
    //     socketRef.current.emit("ice-candidate", {
    //       userId,
    //       candidate: event.candidate,
    //     });
    //   }
    // };

    return peer;
  };

  const handleNegotiationNeededEvent = (userId) => {
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userId,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  };

  const handleReceiveCall = (incoming) => {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            peerRef.current.addTrack(track, userStream.current)
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("answer", payload);
      });
  };

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit("ice-candidate", payload);
    }
  };

  const handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  };

  const handleTrackEvent = (e) => {
    partnerVideo.current.srcObject = e.streams[0];
  };

  return (
    <div>
      <video autoPlay ref={userVideo}></video>
      <video autoPlay ref={partnerVideo}></video>
    </div>
  );
}

export default Room;
