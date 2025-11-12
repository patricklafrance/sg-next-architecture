import { Div, H2, Text } from "@hopper-ui/components";
import { getJson } from "@packages/core";
import { useEnvironmentVariables } from "@squide/env-vars";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function MigrationPage() {
    const environmentVariables = useEnvironmentVariables();

    const { data: characters } = useSuspenseQuery({ queryKey: [`${environmentVariables.migrationApiBaseUrl}/character/1,2`], queryFn: async () => {
        return (await getJson(`${environmentVariables.migrationApiBaseUrl}/character/1,2`)).data as Character[];
    } });

    return (
        <Div>
            <H2>Migration</H2>
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
        </Div>
    );
}
