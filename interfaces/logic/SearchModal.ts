export interface SearchModalProps {
	visible: boolean;
	onClose: () => void;
	searchQuery: string;
	handleSearch: (text: string) => void; // use handleSearch function instead of setSearchQuery
	isSearching: boolean;
	searchResults: any[];
	onSearchItemPress: (item: any) => void;
}
