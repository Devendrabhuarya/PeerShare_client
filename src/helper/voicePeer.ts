

// const ICE_SERVERS: RTCConfiguration = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//         { urls: "stun:stun1.l.google.com:19302" },
//         { urls: "stun:stun2.l.google.com:19302" },
//         { urls: "stun:stun3.l.google.com:19302" },
//         { urls: "stun:stun4.l.google.com:19302" },
//     ],
// };
class PeerService {
    [x: string]: any;
    peer: any;
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun2.l.google.com:19302",
                            "stun:stun.l.google.com:19302",
                        ],
                    },
                ],
            });
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async getAns(offer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }

    async setRemoteDescription(ans: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }


    async AddIceCandidate(icecandidate: any) {
        this.peer.addIceCandidate(icecandidate);
    }
}
export default PeerService;