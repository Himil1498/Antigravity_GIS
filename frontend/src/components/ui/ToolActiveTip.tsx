import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../store";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";

export const ToolActiveTip: React.FC = () => {
  const activeGISTool = useAppSelector((state) => state.map.activeGISTool);
  const [show, setShow] = useState(false);

  return null;
};
