import { Container, Group, Box, Text, Image } from "@mantine/core";
import classes from "./Navbar.module.css";
import { Link, NavLink } from "@remix-run/react";
import studiosLogo from "./StudiosLogo.svg";

const userLinks = [
  { link: "/privacy-and-security", label: "Privacy & Security" },
  { link: "https://bithell.studio", label: "Bithell Studios site" },
];

const mainLinks = [
  { link: "/", label: "Home" },
  { link: "/projects/adam-rms", label: "AdamRMS" },
];

export function Navbar() {
  const mainItems = mainLinks.map((item, index) => (
    <NavLink to={item.link} key={index} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Text
          className={classes.mainLink}
          style={{
            color: isActive
              ? "light-dark(var(--mantine-color-black), var(--mantine-color-white))"
              : undefined,
            borderBottomColor: isActive
              ? "var(--mantine-primary-color-6)"
              : undefined,
          }}
        >
          {item.label}
        </Text>
      )}
    </NavLink>
  ));

  const secondaryItems = userLinks.map((item) => (
    <Link to={item.link} key={item.label} style={{ textDecoration: "none" }}>
      <Text className={classes.secondaryLink}>{item.label}</Text>
    </Link>
  ));

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Link to={"/"}>
          <Image src={studiosLogo} h={50} alt="Bithell Studios Logo" />
        </Link>
        <Box className={classes.links} visibleFrom="sm">
          <Group justify="flex-end">{secondaryItems}</Group>
          <Group gap={0} justify="flex-end" className={classes.mainLinks}>
            {mainItems}
          </Group>
        </Box>
      </Container>
    </header>
  );
}
