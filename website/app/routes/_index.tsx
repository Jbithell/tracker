import {
  Button,
  Card,
  Container,
  Group,
  Image,
  List,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/cloudflare";
import AdamRMSLogo from "~/components/AdamRMS/logo.svg";
import { Link } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
export const meta: MetaFunction = () => {
  return [{ title: "Bithell Studios Telemetry and Analytics Platform" }];
};

export default function Index() {
  return (
    <Container mt={"lg"}>
      <Title order={1} mb={"md"}>
        Bithell Studios Telemetry and Analytics
      </Title>
      <Text mb={"md"}>
        This open-source platform collects telemetry data from open-source
        applications, such as AdamRMS. It also allows you to track your own
        open-source projects, by sending telemetry data to this platform.
      </Text>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing={50} mt={30}>
        <Card withBorder padding="lg">
          <Card.Section>
            <Image
              w="fill"
              fit="contain"
              src={AdamRMSLogo}
              alt="AdamRMS Logo"
            />
          </Card.Section>

          <Group justify="space-between" mt="xl">
            <Text fz="sm" fw={700}>
              AdamRMS
            </Text>
            <Group gap={5}>
              <Link to="/projects/adam-rms">
                <Button
                  variant="light"
                  rightSection={<IconArrowRight size={14} />}
                >
                  View project
                </Button>
              </Link>
            </Group>
          </Group>
          <Text mt="sm" mb="md" c="dimmed" fz="xs">
            AdamRMS is a free, open source advanced Rental Management System for
            Theatre, AV & Broadcast
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
