import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { db } from "../d1client.server";
import { AdamRMSInstallations } from "../db/schema/AdamRMSInstallations";
import { Link, useLoaderData } from "@remix-run/react";
import { and, eq, gte, isNotNull, lt, max } from "drizzle-orm";
import {
  Button,
  Card,
  Container,
  Group,
  Image,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { StatsGrid } from "~/components/AdamRMS/StatsGrid";
import AdamRMSLogo from "~/components/AdamRMS/logo.svg";
import { AdamRMSTimeSeries } from "~/db/schema/AdamRMSTimeSeries";
import { IconArrowUpRight, IconLock } from "@tabler/icons-react";
import {
  InstallationsBarChart,
  getMonthName,
  getNextMonth,
  getPreviousMonths,
} from "~/components/AdamRMS/InstallationsBarChart";
export const meta: MetaFunction = () => {
  return [{ title: "AdamRMS Project | Telemetry and Analytics" }];
};
const getInstallationStatsInMonth = async (
  env: Env,
  month: number,
  year: number
) => {
  const nextMonth = getNextMonth(month, year);
  const query = await db(env.DB)
    .select({
      timestamp: max(AdamRMSTimeSeries.timestamp),
      id: AdamRMSTimeSeries.id,
      version: AdamRMSTimeSeries.version,
    })
    .from(AdamRMSTimeSeries)
    .leftJoin(
      AdamRMSInstallations,
      eq(AdamRMSTimeSeries.installationId, AdamRMSInstallations.id)
    )
    .where(
      and(
        isNotNull(AdamRMSInstallations.rootUrl),
        eq(AdamRMSInstallations.devMode, false),
        gte(
          AdamRMSTimeSeries.timestamp,
          new Date(`01 ${getMonthName(month)} ${year}`)
        ),
        lt(
          AdamRMSTimeSeries.timestamp,
          new Date(`01 ${getMonthName(nextMonth.month)} ${nextMonth.year}`)
        )
      )
    )
    .groupBy(AdamRMSTimeSeries.installationId);

  const installations: { [id: string]: number } = {};
  for (const row of query) {
    if (installations[row.version] === undefined)
      installations[row.version] = 0;
    installations[row.version] += 1;
  }
  return installations;
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const date = new Date();
  date.setDate(date.getDate() - 90);
  const installationsSeenLast90Days = await db(env.DB)
    .select({
      rootUrl: AdamRMSInstallations.rootUrl,
      hidden: AdamRMSInstallations.hidden,
      userDefinedString: AdamRMSInstallations.userDefinedString,
      metaData: AdamRMSInstallations.metaData,
    })
    .from(AdamRMSInstallations)
    .where(
      and(
        isNotNull(AdamRMSInstallations.rootUrl),
        eq(AdamRMSInstallations.devMode, false),
        gte(AdamRMSInstallations.latestHeardTimestamp, date)
      )
    );
  const totals = {
    instances: 0,
    users: 0,
    assetsCount: 0,
    assetsValueUSD: 0,
    assetsMassKg: 0,
  };
  installationsSeenLast90Days.forEach((installation) => {
    if (!installation.metaData) return;
    totals.assetsCount += (installation.metaData.assetsCount as number) || 0;
    totals.assetsValueUSD +=
      (installation.metaData.assetsValueUSD as number) || 0;
    totals.assetsMassKg += (installation.metaData.assetsMassKg as number) || 0;
    totals.instances += (installation.metaData.instances as number) || 0;
    totals.users += (installation.metaData.users as number) || 0;
  });
  const historicInstallationStats: Array<{
    month: number;
    year: number;
    monthName: string;
    installation: Awaited<ReturnType<typeof getInstallationStatsInMonth>>;
  }> = [];
  for (const date of getPreviousMonths(6)) {
    historicInstallationStats.push({
      month: date.month,
      year: date.year,
      monthName: getMonthName(date.month),
      installation: await getInstallationStatsInMonth(
        env,
        date.month,
        date.year
      ),
    });
  }
  return json({
    installationsSeenLast90DaysCount: installationsSeenLast90Days.length,
    installationsTable: installationsSeenLast90Days
      .filter((installation) => installation.hidden !== true)
      .map((installation) => ({
        rootUrl: installation.rootUrl,
        userDefinedString: installation.userDefinedString,
      })),
    totals,
    historicInstallationStats,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <Container mt={"xl"}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image w="fill" fit="contain" src={AdamRMSLogo} alt="AdamRMS Logo" />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>AdamRMS</Text>
          <Link to="/privacy-and-security">
            <Button variant="light" rightSection={<IconLock size={14} />}>
              Privacy
            </Button>
          </Link>
        </Group>

        <Text size="sm" c="dimmed">
          AdamRMS is a free, open source advanced Rental Management System for
          Theatre, AV & Broadcast
        </Text>

        <Link to="https://adam-rms.com">
          <Button
            fullWidth
            radius="md"
            mt="md"
            rightSection={<IconArrowUpRight size={14} />}
          >
            Website
          </Button>
        </Link>
      </Card>

      {data.installationsSeenLast90DaysCount > 0 ? (
        <>
          <StatsGrid
            data={[
              {
                title: "Installations",
                icon: "receipt",
                value: data.installationsSeenLast90DaysCount.toString(),
                diff: null,
                description: "Installations seen in the last 90 days",
              },
              {
                title: "Total Business Instances",
                icon: "coin",
                value: data.totals.instances.toString(),
                diff: null,
                description:
                  "Total number businesses (instances) created across all installations seen in the last 90 days",
              },
              {
                title: "Total Users",
                icon: "user",
                value: data.totals.users.toString(),
                diff: null,
                description:
                  "Total number of users across participating installations seen in the last 90 days",
              },
              {
                title: "Total Assets",
                icon: "discount",
                value: data.totals.assetsCount.toString(),
                diff: null,
                description:
                  "Total number of assets across participating installations seen in the last 90 days",
              },
              {
                title: "Total Mass of Assets",
                icon: "discount",
                value: data.totals.assetsMassKg.toString(),
                diff: null,
                description:
                  "Total mass of assets across participating installations seen in the last 90 days, in Kilograms",
              },
              /*{
                title: "Total Assets",
                icon: "coin",
                value: data.totals.assetsValueUSD.toString(),
                diff: null,
                description:
                  "Total value of all assets across participating installations seen in the last 90 days, in USD",
              },*/
            ]}
          />
          <Card padding="lg" radius="md" withBorder>
            <Title
              order={4}
              fw={500}
              mb="md"
              style={{ textTransform: "uppercase" }}
            >
              Versions Installed
            </Title>
            <InstallationsBarChart data={data.historicInstallationStats} />
          </Card>
          <Card padding="lg" radius="md" withBorder mt={"md"}>
            <Title order={4} mb="md" style={{ textTransform: "uppercase" }}>
              Installations
            </Title>
            <Text mb="md" c="dimmed">
              Businesses who have opted-in to sharing their installation on the
              platform. All other installation statistics are anonymised.
            </Text>
            <Table>
              <Table.Thead>
                <Table.Th>URL</Table.Th>
                <Table.Th>Note</Table.Th>
              </Table.Thead>
              <Table.Tbody>
                {data.installationsTable.map((installation, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Link
                        to={installation.rootUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {installation.rootUrl}
                      </Link>
                    </Table.Td>
                    <Table.Td>{installation.userDefinedString}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </>
      ) : (
        <div>
          <h1>No installations found</h1>
        </div>
      )}
    </Container>
  );
}
