import { metro, patcher, logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

let patches: (() => void)[] = [];

function moveGuildToTop(guildId: string) {
    try {
        const actions = metro.findByProps(
            "moveGuild",
            "moveGuildToPosition"
        );

        if (actions?.moveGuildToPosition) {
            actions.moveGuildToPosition(guildId, 0);
            logger.log(`Moved guild ${guildId} to top`);
            return;
        }

        if (actions?.moveGuild) {
            actions.moveGuild(guildId, 0);
            logger.log(`Moved guild ${guildId} to top`);
            return;
        }

        logger.log("Latest Used Servers: native reorder action not found");
    } catch (e) {
        logger.error(`Latest Used Servers: ${String(e)}`);
    }
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            /*
             * Discord dispatches this when the current user sends
             * a message. We only react to messages authored by us.
             */
            const Dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            if (!Dispatcher) {
                logger.error("Latest Used Servers: dispatcher not found");
                return;
            }

            const handler = (event: any) => {
                if (!event) return;

                const authorId =
                    event.message?.author?.id ??
                    event.author?.id;

                const currentUser =
                    metro.findByProps("getCurrentUser")?.getCurrentUser?.();

                if (!currentUser || authorId !== currentUser.id) {
                    return;
                }

                const guildId =
                    event.message?.guild_id ??
                    event.guildId;

                if (!guildId) return;

                storage.recentServers = [
                    guildId,
                    ...(storage.recentServers ?? []).filter(
                        (id: string) => id !== guildId
                    ),
                ].slice(0, 100);

                moveGuildToTop(guildId);
            };

            Dispatcher.subscribe("MESSAGE_CREATE", handler);

            patches.push(() => {
                try {
                    Dispatcher.unsubscribe("MESSAGE_CREATE", handler);
                } catch {}
            });

            logger.log("Latest Used Servers: message tracking enabled");
        } catch (e) {
            logger.error(`Latest Used Servers: ${String(e)}`);
        }
    },

    onUnload: () => {
        for (const unpatch of patches) {
            try {
                unpatch();
            } catch {}
        }

        patches = [];
        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};
