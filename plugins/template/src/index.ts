import { React } from "@vendetta/metro/common";
import { metro, logger } from "@vendetta";
import { findByName } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import Settings from "./Settings";

let patches: (() => void)[] = [];
let detected: string[] = [];

function scanComponent(name: string, component: any) {
    if (!component) return;

    try {
        const original = component;

        if (typeof original !== "function") return;

        const wrapped = function (...args: any[]) {
            try {
                const props = args[0];

                if (
                    props &&
                    (
                        props.guildId ||
                        props.guildID ||
                        props.serverId ||
                        props.guild ||
                        props.channel
                    )
                ) {
                    if (!detected.includes(name)) {
                        detected.push(name);
                        logger.log(
                            `Latest Used Servers: detected ${name}`
                        );
                    }
                }
            } catch {}

            return original.apply(this, args);
        };

        return wrapped;
    } catch {}
}

export default {
    onLoad() {
        logger.log(
            "Latest Used Servers: component scanner loaded"
        );

        try {
            const candidates = metro.findAll(
                (module: any) => {
                    if (!module) return false;

                    const name =
                        module?.default?.displayName ??
                        module?.displayName ??
                        "";

                    return /guild|server|folder|channel/i.test(
                        String(name)
                    );
                }
            );

            logger.log(
                `Latest Used Servers: ${candidates.length} possible components`
            );

            for (const module of candidates) {
                const component =
                    module?.default ?? module;

                const name =
                    component?.displayName ??
                    component?.name ??
                    "Unknown";

                if (
                    typeof component === "function" &&
                    !detected.includes(String(name))
                ) {
                    detected.push(String(name));
                }
            }

            logger.log(
                `Latest Used Servers candidates: ${detected.join(", ")}`
            );
        } catch (e) {
            logger.error(
                `Latest Used Servers: ${String(e)}`
            );
        }
    },

    onUnload() {
        patches.forEach((unpatch) => {
            try {
                unpatch();
            } catch {}
        });

        patches = [];
        detected = [];
    },

    settings: Settings,
};
