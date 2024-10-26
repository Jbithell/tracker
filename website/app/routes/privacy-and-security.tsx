import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Code,
  Container,
  Group,
  List,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { type MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { IconBrandGithub } from "@tabler/icons-react";
import AdamRMSLogoIcon from "~/components/AdamRMS/logoicon.svg";
import { apiData } from "./projects.adam-rms.upload[.json]";
export const meta: MetaFunction = () => {
  return [
    {
      title:
        "Privacy and Security | Bithell Studios Telemetry and Analytics Platform",
    },
  ];
};

export default function Index() {
  return (
    <Container mt={"lg"}>
      <Title order={1}>Privacy and Security</Title>
      <Text mb={"sm"}>
        The platform runs on Cloudflare Workers, is open source and operates
        under the following privacy principles:
      </Text>
      <List>
        <List.Item>No personal data is stored or collected</List.Item>
        <List.Item>
          All data stored is shown transparently in the source code
        </List.Item>
        <List.Item>Data is presented as-is, without processing</List.Item>
      </List>
      <Text mt={"lg"} mb={"sm"}>
        You can read the entire source code of the platform at any time on{" "}
        <Link to="https://github.com/bstudios/telemetry-and-analytics">
          <Button
            rightSection={<IconBrandGithub />}
            variant="default"
            color="gray"
            size="compact-md"
          >
            Github
          </Button>
        </Link>{" "}
        including the deployment pipeline which is used to deploy the platform
        to Cloudflare.
      </Text>
      <Title order={2} mb="md">
        Data collected by application
      </Title>
      <Accordion chevronPosition="right" variant="contained">
        <Accordion.Item value="adamrms">
          <Accordion.Control>
            <Group wrap="nowrap">
              <Avatar size="lg" src={AdamRMSLogoIcon} alt="AdamRMS Logo" />
              <div>
                <Text>AdamRMS</Text>
                <Text size="sm" c="dimmed" fw={400}>
                  AdamRMS is a free, open source advanced Rental Management
                  System for Theatre, AV & Broadcast
                </Text>
              </div>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm">
              Sending telemetry data is not supported (disabled) before version{" "}
              <Link to="https://github.com/adam-rms/adam-rms/releases/tag/v1.200.0">
                <Code>v1.200</Code>
              </Link>{" "}
              of AdamRMS. For <Code>v1.200</Code> and above, the following data
              is collected. Server administrators can select between{" "}
              <Code>Limited</Code> and <Code>Standard</Code> telemetry modes
              during setup.
            </Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Collected in Limited?</Table.Th>
                  <Table.Th>Collected in Standard?</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {apiData.map((element) => (
                  <Table.Tr key={element.key}>
                    <Table.Td>
                      <Code>{element.key}</Code>
                    </Table.Td>
                    <Table.Td>{element.description}</Table.Td>
                    <Table.Td>
                      {element.modes.includes("Limited") ? (
                        <Badge color="green">Yes</Badge>
                      ) : (
                        <Badge color="red">No</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {element.modes.includes("Standard") ? (
                        <Badge color="green">Yes</Badge>
                      ) : (
                        <Badge color="red">No</Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
