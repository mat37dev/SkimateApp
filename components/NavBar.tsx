import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link, usePathname } from "expo-router";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
// Si tu gères un thème (light/dark), tu peux importer le hook useThemeColor
import { useThemeColor } from "@/hooks/useThemeColor";
import { Href } from "expo-router/build/types";

interface NavBarProps {
	// Autres props éventuelles
}

const NavBar: React.FC<NavBarProps> = () => {
	// Récupère la route active pour savoir quel bouton est “sélectionné”
	const pathname = usePathname();

	// Couleurs depuis le theme (optionnel) :
	const backgroundColor = useThemeColor({}, "background");
	const activeColor = useThemeColor({}, "tint");
	const inactiveColor = useThemeColor({}, "icon");

	// Config de chaque onglet : href, label, icône, etc.
	interface NavItem {
		href: Href;
		label: string;
		icon: any;
		iconName: string;
	}
	const navItems: NavItem[] = [
		{
			href: "/login",
			label: "Login",
			icon: Ionicons,
			iconName: "log-in-outline",
		},
		{
			href: "/statistics",
			label: "Stats",
			icon: Ionicons,
			iconName: "stats-chart",
		},
		{
			href: "/dashboard",
			label: "Stations",
			icon: FontAwesome6,
			iconName: "mountain",
		},
		{
			href: "/map",
			label: "Map",
			icon: Ionicons,
			iconName: "map-outline",
		},
		{
			href: "/profile",
			label: "profil",
			icon: Ionicons,
			iconName: "person",
		},
	];

	return (
		<View style={[styles.container, { backgroundColor }]}>
			{navItems.map((item) => {
				const isActive = pathname === item.href;
				const IconComponent = item.icon;

				return (
					<Link key={item.label} href={item.href} asChild>
						<TouchableOpacity style={styles.navItem}>
							<IconComponent
								name={item.iconName}
								size={24}
								color={isActive ? activeColor : inactiveColor}
							/>
							<Text
								style={[
									styles.label,
									{
										color: isActive
											? activeColor
											: inactiveColor,
									},
								]}
							>
								{item.label}
							</Text>
						</TouchableOpacity>
					</Link>
				);
			})}
		</View>
	);
};

export default NavBar;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		height: 60,
	},
	navItem: {
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontSize: 10,
		marginTop: 2,
	},
});
