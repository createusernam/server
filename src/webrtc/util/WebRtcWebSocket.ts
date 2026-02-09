import { WebSocket } from "@spacebar/gateway";
import type { Codec, WebRtcClient } from "@spacebarchat/spacebar-webrtc-types";

export interface WebRtcWebSocket extends WebSocket {
    type: "guild-voice" | "dm-voice" | "stream";
    webRtcClient?: WebRtcClient<WebRtcWebSocket>;
    /** Codecs from Select Protocol, used for renegotiation offer. */
    savedCodecs?: Codec[];
    /** True after sending renegotiation offer, until answer is applied. */
    pendingRenegotiationAnswer?: boolean;
}
