import React, { createContext, useContext, useState, useEffect } from 'react';

// Create language context
const LanguageContext = createContext();

// Dictionary of translations
const translations = {
  en: {
    // Common
    appTitle: 'Chess Club',
    greeting: 'Hello',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save Changes',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    
    // Auth
    login: 'Login',
    loginTitle: 'Chess Club Login',
    playerName: 'Player Name',
    pin: 'PIN',
    loginButton: 'Login',
    
    // Navigation
    dashboard: 'Dashboard',
    rankings: 'Rankings',
    submitGame: 'Submit Game',
    profile: 'Profile',
    adminNav: 'Admin',
    logout: 'Logout',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    yourElo: 'Your ELO',
    eloHistory: 'ELO History',
    recentGames: 'Recent Games',
    noRecentGames: 'No recent games found',
    keyStats: 'Key Statistics',
    allGames: 'Games',
    viewAllGames: 'View All Games',
    gamesDescription: 'Browse all games played in the club. Filter games by time period or by player.',
    
    // Rankings & Games
    playerRankings: 'Player Rankings',
    rank: 'Rank',
    player: 'Player',
    elo: 'ELO',
    gamesPlayed: 'Games',
    performance: 'Performance',
    filterByTime: 'Filter by time',
    allTime: 'All time',
    thisMonth: 'This month',
    thisWeek: 'This week',
    filterOptions: 'Filter Options',
    timeRange: 'Time Period',
    lastDay: 'Last Day',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    lastYear: 'Last Year',
    allPlayers: 'All Players',
    noGamesFound: 'No games found with the selected filters.',
    reset: 'Reset',
    
    // Submit Game
    submitGameTitle: 'Submit New Game',
    whitePlayer: 'White Player',
    blackPlayer: 'Black Player',
    selectPlayer: 'Select Player',
    result: 'Result',
    whiteWins: 'White Wins (1-0)',
    blackWins: 'Black Wins (0-1)',
    draw: 'Draw (1/2-1/2)',
    enterPin: 'Enter PIN',
    submitGameButton: 'Submit Game',
    
    // Profile
    profileTitle: 'Player Profile',
    playerInfo: 'Player Information',
    name: 'Name',
    currentElo: 'Current ELO',
    accountType: 'Account Type',
    admin: 'Admin',
    playerType: 'Player',
    theme: 'Theme',
    language: 'Language',
    changePin: 'Change PIN',
    currentPin: 'Current PIN',
    newPin: 'New PIN',
    confirmPin: 'Confirm New PIN',
    updatePin: 'Update PIN',
    statistics: 'Statistics',
    wins: 'Wins',
    losses: 'Losses',
    draws: 'Draws',
    totalGames: 'Total Games',
    winRate: 'Win Rate',
    gameHistory: 'Game History',
    date: 'Date',
    opponent: 'Opponent',
    color: 'Color',
    eloChange: 'ELO Change',
    white: 'White',
    black: 'Black',
    win: 'Win',
    loss: 'Loss',
    noGameHistory: 'No game history found',
    loadingProfile: 'Loading profile...',
    allFieldsRequired: 'All fields are required',
    pinMustMatch: 'New PIN and Confirm PIN must match',
    pinMinLength: 'PIN must be at least 4 characters long',
    incorrectPin: 'Current PIN is incorrect',
    pinUpdateSuccess: 'PIN updated successfully',
    failedToUpdatePin: 'Failed to update PIN',
    pinUpdateError: 'An error occurred while updating PIN',
    
    // Admin
    adminTitle: 'Admin Panel',
    playerManagement: 'Player Management',
    gameManagement: 'Game Management',
    addNewPlayer: 'Add New Player',
    initialElo: 'Initial ELO',
    adminAccess: 'Admin Access',
    addPlayer: 'Add Player',
    editPlayer: 'Edit Player',
    adminGames: 'All Games',
    recentGamesFilter: 'Recent Games',
    editGame: 'Edit Game',
    verified: 'Verified',
    status: 'Status',
    actions: 'Actions',
  },
  fr: {
    // Common
    appTitle: 'Club d\'Échecs',
    greeting: 'Bonjour',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès!',
    
    // Auth
    login: 'Se Connecter',
    loginTitle: 'Connexion Club d\'Échecs',
    playerName: 'Nom du Joueur',
    pin: 'NIP',
    loginButton: 'Se Connecter',
    
    // Navigation
    dashboard: 'Tableau de Bord',
    rankings: 'Classements',
    submitGame: 'Soumettre une Partie',
    profile: 'Profil',
    adminNav: 'Admin',
    logout: 'Déconnexion',
    
    // Dashboard
    welcomeBack: 'Bienvenue',
    yourElo: 'Votre ELO',
    eloHistory: 'Historique ELO',
    recentGames: 'Parties Récentes',
    noRecentGames: 'Aucune partie récente trouvée',
    keyStats: 'Statistiques Clés',
    allGames: 'Parties',
    viewAllGames: 'Voir Toutes les Parties',
    gamesDescription: 'Parcourir toutes les parties jouées dans le club. Filtrer les parties par période ou par joueur.',
    
    // Rankings & Games
    playerRankings: 'Classement des Joueurs',
    rank: 'Rang',
    player: 'Joueur',
    elo: 'ELO',
    gamesPlayed: 'Parties',
    performance: 'Performance',
    filterByTime: 'Filtrer par période',
    allTime: 'Tout',
    thisMonth: 'Ce mois',
    thisWeek: 'Cette semaine',
    filterOptions: 'Options de Filtrage',
    timeRange: 'Période',
    lastDay: 'Dernier Jour',
    lastWeek: 'Dernière Semaine',
    lastMonth: 'Dernier Mois',
    lastYear: 'Dernière Année',
    allPlayers: 'Tous les Joueurs',
    noGamesFound: 'Aucune partie trouvée avec les filtres sélectionnés.',
    reset: 'Réinitialiser',
    
    // Submit Game
    submitGameTitle: 'Soumettre une Nouvelle Partie',
    whitePlayer: 'Joueur Blanc',
    blackPlayer: 'Joueur Noir',
    selectPlayer: 'Sélectionner Joueur',
    result: 'Résultat',
    whiteWins: 'Blanc Gagne (1-0)',
    blackWins: 'Noir Gagne (0-1)',
    draw: 'Nulle (1/2-1/2)',
    enterPin: 'Entrer NIP',
    submitGameButton: 'Soumettre la Partie',
    
    // Profile
    profileTitle: 'Profil du Joueur',
    playerInfo: 'Informations du Joueur',
    name: 'Nom',
    currentElo: 'ELO Actuel',
    accountType: 'Type de Compte',
    admin: 'Administrateur',
    playerType: 'Joueur',
    theme: 'Thème',
    language: 'Langue',
    changePin: 'Changer NIP',
    currentPin: 'NIP Actuel',
    newPin: 'Nouveau NIP',
    confirmPin: 'Confirmer NIP',
    updatePin: 'Mettre à Jour le NIP',
    statistics: 'Statistiques',
    wins: 'Victoires',
    losses: 'Défaites',
    draws: 'Nulles',
    totalGames: 'Total des Parties',
    winRate: 'Taux de Victoire',
    gameHistory: 'Historique des Parties',
    date: 'Date',
    opponent: 'Adversaire',
    color: 'Couleur',
    eloChange: 'Changement ELO',
    white: 'Blanc',
    black: 'Noir',
    win: 'Victoire',
    loss: 'Défaite',
    noGameHistory: 'Aucun historique de parties trouvé',
    loadingProfile: 'Chargement du profil...',
    allFieldsRequired: 'Tous les champs sont obligatoires',
    pinMustMatch: 'Le nouveau NIP et la confirmation doivent correspondre',
    pinMinLength: 'Le NIP doit comporter au moins 4 caractères',
    incorrectPin: 'Le NIP actuel est incorrect',
    pinUpdateSuccess: 'NIP mis à jour avec succès',
    failedToUpdatePin: 'Échec de la mise à jour du NIP',
    pinUpdateError: 'Une erreur est survenue lors de la mise à jour du NIP',
    
    // Admin
    adminTitle: 'Panneau d\'Administration',
    playerManagement: 'Gestion des Joueurs',
    gameManagement: 'Gestion des Parties',
    addNewPlayer: 'Ajouter un Nouveau Joueur',
    initialElo: 'ELO Initial',
    adminAccess: 'Accès Administrateur',
    addPlayer: 'Ajouter Joueur',
    editPlayer: 'Modifier Joueur',
    adminGames: 'Toutes les Parties',
    recentGamesFilter: 'Parties Récentes',
    editGame: 'Modifier Partie',
    verified: 'Vérifiée',
    status: 'Statut',
    actions: 'Actions',
  }
};

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('chessClubLanguage') || 'en';
  });
  
  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('chessClubLanguage', language);
  }, [language]);
  
  // Get text for a specific key in the current language
  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);