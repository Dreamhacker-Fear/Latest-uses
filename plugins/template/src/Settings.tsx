import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import { React } from "@vendetta/metro/common";

const { FormSection, FormText, FormRow } = Forms;

export default () => {
    const [, update] = React.useState(0);

    const action = storage.lastGuildAction ?? "Nothing captured yet.";
    const payload = storage.lastGuildPayload ?? "";

    return (
        <>
            <FormSection title="Guild Reorder Scanner">
                <FormText>
                    Drag a server manually, then reopen this page.
                </FormText>

                <FormRow
                    label="Last detected action"
                    subLabel={action}
                />

                <FormRow
                    label="Payload"
                    subLabel={payload || "No payload captured."}
                />

                <FormRow
                    label="Refresh"
                    onPress={() => update((x) => x + 1)}
                />

                <FormRow
                    label="Clear"
                    onPress={() => {
                        storage.lastGuildAction = "";
                        storage.lastGuildPayload = "";
                        update((x) => x + 1);
                    }}
                />
            </FormSection>
        </>
    );
};
