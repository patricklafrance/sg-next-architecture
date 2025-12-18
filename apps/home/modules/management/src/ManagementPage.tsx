import { Div, H2, Paragraph, Text } from "@hopper-ui/components";
import { getJson } from "@packages/core";
import { useEnvironmentVariables, useFeatureFlag } from "@squide/firefly";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function ManagementPage() {
    const canShowCharacters = useFeatureFlag("show-characters", true);
    const environmentVariables = useEnvironmentVariables();

    const { data: characters } = useSuspenseQuery({ queryKey: [`${environmentVariables.managementApiBaseUrl}/character/1,2`], queryFn: async () => {
        return (await getJson(`${environmentVariables.managementApiBaseUrl}/character/1,2`)).data as Character[];
    } });

    return (
        <Div>
            <H2>Management24234324</H2>
            {canShowCharacters ? (
                <Div>
                    {characters.map(x => {
                        return (
                            <Div key={x.id}>
                                <Text>Id: {x.id}</Text>
                                <Text> - </Text>
                                <Text>Name: {x.name}</Text>
                                <Text> - </Text>
                                <Text>Species: {x.species}</Text>
                            </Div>
                        );
                    })}
                </Div>
            ) : (
                <Paragraph>The <code>show-characters</code> feature flag is off.</Paragraph>
            )}
        </Div>
    );
}
