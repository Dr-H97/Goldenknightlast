import React, { createContext, useContext, useState, useEffect } from 'react';

// Create language context
const LanguageContext = createContext();

// Dictionary of translations
const translations = {
  en: {
    // Common
    appTitle: 'The Golden Knight Chess Club',
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
    loginTitle: 'The Golden Knight Chess Club',
    playerName: 'Player name',
    pin: 'PIN',
    loginButton: 'Login',
    loginWithGoogle: 'Login with Google',
    or: 'or',
    signInWithGoogle: 'Sign in with Google',
    signInTo: 'Sign in to',
    bySigningIn: 'By signing in, you agree to our terms and conditions',
    welcome: 'Welcome to',
    heroText: 'Track your chess progress, submit game results, and compete with club members in our ELO-based rating system.',
    
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
    
    // Additional translations for dashboard and statistics
    statisticsDetailed: 'Detailed Statistics',
    mostPlayedOpponent: 'Most Played Opponent',
    winRateWhite: 'Win Rate with White',
    winRateBlack: 'Win Rate with Black',
    fromXGames: 'From X games',
    playedXGames: 'Played X games',
    
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
    appTitle: 'Le Cavalier d\'Or',
    greeting: 'Bonjour',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer les changements',
    delete: 'Supprimer',
    edit: 'Modifier',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès !',
    viewProfile: 'Voir votre profile',
    
    // Auth
    login: 'Se Connecter',
    loginTitle: 'Le Cavalier d\'Or',
    playerName: 'Nom du Joueur',
    pin: 'Code PIN',
    loginButton: 'Se Connecter',
    loginWithGoogle: 'Se connecter avec Google',
    or: 'ou',
    signInWithGoogle: 'Se connecter avec Google',
    signInTo: 'Se connecter à',
    bySigningIn: 'En vous connectant, vous acceptez nos conditions d\'utilisation',
    welcome: 'Bienvenue sur',
    heroText: 'Suivez vos progrès aux échecs, soumettez les résultats de vos parties, et jouez avec les membres du club dans notre système de classement basé sur l\'ELO.',
    
    // Navigation
    dashboard: 'Tableau de Bord',
    rankings: 'Classements',
    submitGame: 'Soumettre une Partie',
    profile: 'Profil',
    adminNav: 'Admin',
    logout: 'Déconnexion',
    connected: 'Connecté',
    
    // Dashboard
    welcomeBack: 'Bienvenue',
    yourElo: 'ELO actuel',
    eloHistory: 'Historique ELO',
    recentGames: 'Parties Récentes',
    noRecentGames: 'Aucune partie récente trouvée',
    keyStats: 'Statistiques clés',
    allGames: 'Toutes les Parties',
    viewAllGames: 'Voir Toutes les Parties',
    gamesDescription: 'Parcourez toutes les parties jouées dans le club. Filtrez-les par période ou par joueur.',
    record: 'Bilan',
    statisticsDetailed: 'Statistiques Détaillées',
    mostPlayedOpponent: 'Adversaire le Plus Fréquent',
    winRateWhite: 'Taux de Victoire avec les Blancs',
    winRateBlack: 'Taux de Victoire avec les Noirs',
    fromXGames: 'Sur X parties',
    playedXGames: 'X parties jouées',
    
    // Rankings & Games
    playerRankings: '♘ Classements du Club',
    rank: 'Rang',
    player: 'Joueur',
    elo: 'ELO',
    gamesPlayed: 'Parties',
    performance: 'Performance',
    filterByTime: 'Filtrer par période',
    allTime: 'Tout Temps',
    thisMonth: 'Ce mois',
    thisWeek: 'Cette semaine',
    filterOptions: 'Options de filtrage',
    timeRange: 'Période',
    lastDay: 'Dernier jour',
    lastWeek: 'Dernière semaine',
    lastMonth: 'Dernier mois',
    lastYear: 'Dernière année',
    oneMonth: 'Un Mois',
    threeMonths: 'Trois Mois',
    sixMonths: 'Six Mois',
    oneYear: 'Un An',
    allPlayers: 'Tous les joueurs',
    noGamesFound: 'Aucune partie trouvée avec les filtres sélectionnés.',
    reset: 'Réinitialiser les Filtres',
    totalPlayers: 'Total de Joueurs',
    rankingType: 'Type de Classement',
    
    // Submit Game
    submitGameTitle: 'Soumettre le Résultat d\'une Partie',
    whitePlayer: 'Joueur avec les Blancs',
    blackPlayer: 'Joueur avec les Noirs',
    selectPlayer: 'Sélectionner un Joueur avec les Noirs',
    result: 'Résultat',
    whiteWins: 'Victoire des Blancs',
    blackWins: 'Victoire des Noirs',
    draw: 'Nulle (½–½)',
    enterPin: 'Entrer le code PIN',
    submitGameButton: 'Soumettre une Nouvelle Partie',
    selectResult: 'Sélectionner le Résultat',
    playerAuth: 'Authentification des Joueurs',
    bothPlayerAuth: 'Les deux joueurs doivent confirmer la soumission de cette partie avec leur code PIN',
    whitePlayerPin: 'Code PIN du Joueur Blanc (Admin)',
    blackPlayerPin: 'Code PIN du Joueur Noir (Joueur sélectionné)',
    gameTime: 'Heure',
    
    // Profile
    profileTitle: 'Profil du Joueur',
    playerInfo: 'Informations du Joueur',
    name: 'Nom',
    currentElo: 'ELO actuel',
    accountType: 'Type de compte',
    admin: 'Administrateur',
    playerType: 'Joueur',
    theme: 'Thème',
    lightMode: 'Mode Clair',
    language: 'Langue',
    french: 'Français',
    changePin: 'Changer le code PIN',
    currentPin: 'Code PIN actuel',
    newPin: 'Nouveau code PIN',
    confirmPin: 'Confirmer le code PIN',
    updatePin: 'Mettre à jour le code PIN',
    statistics: 'Statistiques Détaillées',
    wins: 'Victoires',
    losses: 'Défaites',
    draws: 'Nulles',
    totalGames: 'Total des parties',
    winRate: 'Taux de victoire',
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
    pinMustMatch: 'Le nouveau code PIN et la confirmation doivent correspondre',
    pinMinLength: 'Le code PIN doit comporter au moins 4 caractères',
    incorrectPin: 'Le code PIN actuel est incorrect',
    pinUpdateSuccess: 'Code PIN mis à jour avec succès',
    failedToUpdatePin: 'Échec de la mise à jour du code PIN',
    pinUpdateError: 'Une erreur est survenue lors de la mise à jour du code PIN',
    
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
    
    // Set the HTML lang attribute to match the selected language
    document.documentElement.setAttribute('lang', language);
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