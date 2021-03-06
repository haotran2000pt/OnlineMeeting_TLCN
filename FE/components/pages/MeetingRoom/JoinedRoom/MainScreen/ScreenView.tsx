import classNames from "classnames";
import { motion, MotionStyle } from "framer-motion";
import { RiPushpin2Fill } from "react-icons/ri";
import { useAppSelector } from "../../../../../hooks/redux";
import { Peer } from "../../../../../types/room.type";
import { PINNED_SIDE_HEIGHT, PINNED_SIDE_WIDTH } from "./MainScreen";
import PeerBackdrop from "./PeerBackdrop";
import { VideoView } from "./VideoView";

interface ScreenViewProps {
  peer: Peer;
  style: MotionStyle;
  track: MediaStreamTrack | null | undefined;
  isMe?: boolean;
  isPinned: boolean;
  isScreen: boolean;
}

const ScreenView = ({
  peer,
  style,
  track,
  isMe,
  isPinned,
  isScreen,
}: ScreenViewProps) => {
  const pin = useAppSelector((selector) => selector.room.pin);

  const activeSpeaker = useAppSelector(
    (selector) => selector.room.activeSpeaker
  );

  return (
    <motion.div
      style={{
        width: pin && !isPinned ? PINNED_SIDE_WIDTH : style.width,
        height: pin && !isPinned ? PINNED_SIDE_HEIGHT : style.height,
        left: style.left,
        top: style.top,
      }}
      transition={{ duration: 0.1, type: "keyframes" }}
      className={classNames(
        "flex-center rounded-lg select-none overflow-hidden absolute transition-all duration-[0.05]",
        {
          "bg-[#3C4043]": !isPinned,
          ring: activeSpeaker === peer.id && !isScreen,
        }
      )}
    >
      {!track && !isScreen && <PeerBackdrop peer={peer} />}
      <div className="absolute z-50 left-0 bottom-0 py-2 px-4 text-[16px] text-gray-300 font-bold flex items-center space-x-2">
        {isPinned && <RiPushpin2Fill size={20} />}
        <div>{isMe ? "You" : peer.name}</div>
      </div>
      {track && <VideoView isScreen={isScreen} track={track} />}
    </motion.div>
  );
};

export default ScreenView;
