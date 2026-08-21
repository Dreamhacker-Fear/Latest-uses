import { metro, logger } from "@vendetta";
import Settings from "./Settings";

let unsubscribe: (() => void) | null = null;

function moveGuildToTop(guildId: string) {
    try {
        const GuildActions = metro.findByProps("requestMembers");
        const UserSettingsStore = metro.findByProps("guildPositions");

        if (!GuildActions?.move) {
            logger.error("Latest Used Servers: GuildActions.move not found");
            return;
        }

        const positions = UserSettingsStore?.guildPositions;

        if (!Array.isArray(positions)) {
            logger.error("Latest Used Servers: guildPositions not found");
            return;
        }

        const currentIndex = positions.indexOf(guildId);

        if (currentIndex <= 0) {
            return;
        }

        // Discord's native guild reorder operation.
        GuildActions.move(currentIndex, 0);

        logger.log(
            `Latest Used Servers: moved ${guildId} from ${currentIndex} to 0`
        );
    } catch (e) {
        logger.error(`Latest Used Servers: ${String(e)}`);
    }
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const Dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            const UserStore = metro.findByProps(
                "getCurrentUser"
            );

            if (!Dispatcher || !UserStore) {
                logger.error(
                    "Latest Used Servers: required modules not found"
                );
                return;
            }

            const handler = (event: any) => {
                const message = event?.message;

                if (!message?.guild_id) {
                    return;
                }

                const currentUser = UserStore.getCurrentUser?.();

                if (!currentUser) {
                    return;
                }

                // Only react to messages YOU sent.
                if (message.author?.id !== currentUser.id) {
                    return;
                }

                moveGuildToTop(message.guild_id);
            };

            Dispatcher.subscribe("MESSAGE_CREATE", handler);

            unsubscribe = () => {
                try {
                    Dispatcher.unsubscribe(
                        "MESSAGE_CREATE",
                        handler
                    );
                } catch {}
            };

            logger.log(
                "Latest Used Servers: watching sent messages"
            );
        } catch (e) {
            logger.error(
                `Latest Used Servers: ${String(e)}`
            );
        }
    },

    onUnload: () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }

        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};import { metro, logger } from "@vendetta";
import Settings from "./Settings";

let unsubscribe: (() => void) | null = null;

function moveGuildToTop(guildId: string) {
    try {
        const GuildActions = metro.findByProps("requestMembers");
        const UserSettingsStore = metro.findByProps("guildPositions");

        if (!GuildActions?.move) {
            logger.error("Latest Used Servers: GuildActions.move not found");
            return;
        }

        const positions = UserSettingsStore?.guildPositions;

        if (!Array.isArray(positions)) {
            logger.error("Latest Used Servers: guildPositions not found");
            return;
        }

        const currentIndex = positions.indexOf(guildId);

        if (currentIndex <= 0) {
            return;
        }

        // Discord's native guild reorder operation.
        GuildActions.move(currentIndex, 0);

        logger.log(
            `Latest Used Servers: moved ${guildId} from ${currentIndex} to 0`
        );
    } catch (e) {
        logger.error(`Latest Used Servers: ${String(e)}`);
    }
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const Dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            const UserStore = metro.findByProps(
                "getCurrentUser"
            );

            if (!Dispatcher || !UserStore) {
                logger.error(
                    "Latest Used Servers: required modules not found"
                );
                return;
            }

            const handler = (event: any) => {
                const message = event?.message;

                if (!message?.guild_id) {
                    return;
                }

                const currentUser = UserStore.getCurrentUser?.();

                if (!currentUser) {
                    return;
                }

                // Only react to messages YOU sent.
                if (message.author?.id !== currentUser.id) {
                    return;
                }

                moveGuildToTop(message.guild_id);
            };

            Dispatcher.subscribe("MESSAGE_CREATE", handler);

            unsubscribe = () => {
                try {
                    Dispatcher.unsubscribe(
                        "MESSAGE_CREATE",
                        handler
                    );
                } catch {}
            };

            logger.log(
                "Latest Used Servers: watching sent messages"
            );
        } catch (e) {
            logger.error(
                `Latest Used Servers: ${String(e)}`
            );
        }
    },

    onUnload: () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }

        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};
