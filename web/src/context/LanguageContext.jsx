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
    save: 'Save changes',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    viewProfile: 'View profile',
    
    // Auth
    login: 'Login',
    loginTitle: 'Chess Club Login',
    playerName: 'Player name',
    pin: 'PIN',
    loginButton: 'Login',
    
    // Navigation
    dashboard: 'Dashboard',
    rankings: 'Rankings',
    submitGame: 'Submit game',
    profile: 'Profile',
    adminNav: 'Admin',
    logout: 'Logout',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    yourElo: 'Your ELO',
    eloHistory: 'ELO history',
    recentGames: 'Recent games',
    noRecentGames: 'No recent games found',
    keyStats: 'Key statistics',
    allGames: 'Games',
    viewAllGames: 'View all games',
    gamesDescription: 'Browse all games played in the club. Filter games by time period or by player.',
    
    // Rankings & Games
    playerRankings: 'Player rankings',
    rank: 'Rank',
    player: 'Player',
    elo: 'ELO',
    gamesPlayed: 'Games',
    performance: 'Performance',
    filterByTime: 'Filter by time',
    allTime: 'All time',
    thisMonth: 'This month',
    thisWeek: 'This week',
    filterOptions: 'Filter options',
    timeRange: 'Time period',
    lastDay: 'Last day',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastYear: 'Last year',
    oneMonth: 'One month',
    threeMonths: 'Three months',
    sixMonths: 'Six months',
    oneYear: 'One year',
    allPlayers: 'All players',
    noGamesFound: 'No games found with the selected filters.',
    reset: 'Reset',
    
    // Submit Game
    submitGameTitle: 'Submit new game',
    whitePlayer: 'White player',
    blackPlayer: 'Black player',
    selectPlayer: 'Select player',
    result: 'Result',
    whiteWins: 'White wins (1-0)',
    blackWins: 'Black wins (0-1)',
    draw: 'Draw (1/2-1/2)',
    enterPin: 'Enter PIN',
    submitGameButton: 'Submit game',
    
    // Profile
    profileTitle: 'Player profile',
    playerInfo: 'Player information',
    name: 'Name',
    currentElo: 'Current ELO',
    accountType: 'Account type',
    admin: 'Admin',
    playerType: 'Player',
    theme: 'Theme',
    language: 'Language',
    changePin: 'Change PIN',
    currentPin: 'Current PIN',
    newPin: 'New PIN',
    confirmPin: 'Confirm new PIN',
    updatePin: 'Update PIN',
    statistics: 'Statistics',
    wins: 'Wins',
    losses: 'Losses',
    draws: 'Draws',
    totalGames: 'Total games',
    winRate: 'Win rate',
    gameHistory: 'Game history',
    date: 'Date',
    opponent: 'Opponent',
    color: 'Color',
    eloChange: 'ELO change',
    white: 'White',
    black: 'Black',
    win: 'Win',
    loss: 'Loss',
    noGameHistory: 'No game history found',
    loadingProfile: 'Loading profile...',
    allFieldsRequired: 'All fields are required',
    pinMustMatch: 'New PIN and confirm PIN must match',
    pinMinLength: 'PIN must be at least 4 characters long',
    incorrectPin: 'Current PIN is incorrect',
    pinUpdateSuccess: 'PIN updated successfully',
    failedToUpdatePin: 'Failed to update PIN',
    pinUpdateError: 'An error occurred while updating PIN',
    
    // Admin
    adminTitle: 'Admin panel',
    playerManagement: 'Player management',
    gameManagement: 'Game management',
    addNewPlayer: 'Add new player',
    initialElo: 'Initial ELO',
    adminAccess: 'Admin access',
    addPlayer: 'Add player',
    editPlayer: 'Edit player',
    adminGames: 'All games',
    recentGamesFilter: 'Recent games',
    editGame: 'Edit game',
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
    viewProfile: 'Voir profile',
    
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
    recentGames: 'Parties récentes',
    noRecentGames: 'Aucune partie récente trouvée',
    keyStats: 'Statistiques clés',
    allGames: 'Parties',
    viewAllGames: 'Voir toutes les parties',
    gamesDescription: 'Parcourir toutes les parties jouées dans le club. Filtrer les parties par période ou par joueur.',
    
    // Rankings & Games
    playerRankings: 'Classement des joueurs',
    rank: 'Rang',
    player: 'Joueur',
    elo: 'ELO',
    gamesPlayed: 'Parties',
    performance: 'Performance',
    filterByTime: 'Filtrer par période',
    allTime: 'Tout',
    thisMonth: 'Ce mois',
    thisWeek: 'Cette semaine',
    filterOptions: 'Options de filtrage',
    timeRange: 'Période',
    lastDay: 'Dernier jour',
    lastWeek: 'Dernière semaine',
    lastMonth: 'Dernier mois',
    lastYear: 'Dernière année',
    oneMonth: 'Un mois',
    threeMonths: 'Trois mois',
    sixMonths: 'Six mois',
    oneYear: 'Un an',
    allPlayers: 'Tous les joueurs',
    noGamesFound: 'Aucune partie trouvée avec les filtres sélectionnés.',
    reset: 'Réinitialiser',
    
    // Submit Game
    submitGameTitle: 'Soumettre une nouvelle partie',
    whitePlayer: 'Joueur blanc',
    blackPlayer: 'Joueur noir',
    selectPlayer: 'Sélectionner joueur',
    result: 'Résultat',
    whiteWins: 'Blanc gagne (1-0)',
    blackWins: 'Noir gagne (0-1)',
    draw: 'Nulle (1/2-1/2)',
    enterPin: 'Entrer NIP',
    submitGameButton: 'Soumettre la partie',
    
    // Profile
    profileTitle: 'Profil du joueur',
    playerInfo: 'Informations du joueur',
    name: 'Nom',
    currentElo: 'ELO actuel',
    accountType: 'Type de compte',
    admin: 'Administrateur',
    playerType: 'Joueur',
    theme: 'Thème',
    language: 'Langue',
    changePin: 'Changer NIP',
    currentPin: 'NIP actuel',
    newPin: 'Nouveau NIP',
    confirmPin: 'Confirmer NIP',
    updatePin: 'Mettre à jour le NIP',
    statistics: 'Statistiques',
    wins: 'Victoires',
    losses: 'Défaites',
    draws: 'Nulles',
    totalGames: 'Total des parties',
    winRate: 'Taux de victoire',
    gameHistory: 'Historique des parties',
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
    adminTitle: 'Panneau d\'administration',
    playerManagement: 'Gestion des joueurs',
    gameManagement: 'Gestion des parties',
    addNewPlayer: 'Ajouter un nouveau joueur',
    initialElo: 'ELO initial',
    adminAccess: 'Accès administrateur',
    addPlayer: 'Ajouter joueur',
    editPlayer: 'Modifier joueur',
    adminGames: 'Toutes les parties',
    recentGamesFilter: 'Parties récentes',
    editGame: 'Modifier partie',
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