import { logger } from "@vendetta";
import Settings from "./Settings";

export default {
    onLoad() {
        logger.log("Latest Used Servers loaded");
    },

    onUnload() {
        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};
