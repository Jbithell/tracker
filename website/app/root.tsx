import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/code-highlight/styles.css";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import {
  ColorSchemeScript,
  Title,
  Text,
  Button,
  Container,
  Group,
  AppShell,
  LoadingOverlay,
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import classes from "./components/ErrorBoundary.module.css";
import { Navbar } from "./components/Navbar";

const myColor: MantineColorsTuple = [
  "#ffe9f0",
  "#ffd0dd",
  "#faa0b8",
  "#f66d90",
  "#f2426f",
  "#f1275a",
  "#f1184f",
  "#d70841",
  "#c00038",
  "#a9002f",
];

const theme = createTheme({
  primaryColor: "pink",
  colors: {
    pink: myColor,
  },
  primaryShade: 3,
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigating = useNavigation();
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <LoadingOverlay
          visible={navigating.state === "loading"}
          loaderProps={{ type: "oval", size: "xl" }}
        />
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.log(error); // Send error to CF workers dashboard
  if (isRouteErrorResponse(error)) {
    return (
      <Container className={classes.root}>
        <div className={classes.label}>{error.status}</div>
        <Title className={classes.title}>{error.statusText}</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          {error.data}
        </Text>
        <Group justify="center">
          <Link to="/">
            <Button variant="subtle" size="md">
              Take me back to home page
            </Button>
          </Link>
        </Group>
      </Container>
    );
  } else if (error instanceof Error) {
    return (
      <Container className={classes.root}>
        <Title className={classes.title}>{error.name}</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          {process.env.NODE_ENV !== "production"
            ? error.message
            : "An error occurred trying to load this page, please try again later."}
        </Text>
        <Group justify="center">
          <Link to="/">
            <Button variant="subtle" size="md">
              Take me back to home page
            </Button>
          </Link>
        </Group>
      </Container>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
