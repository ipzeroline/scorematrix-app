import type { Team } from '@/types/team';

export const teams: Team[] = [
  // ===== English-inspired (league-01) =====
  { id: 'team-01', name: 'London United', shortName: 'LON', crest: '/images/teams/team-01.svg', country: 'England', leagueId: 'league-01', form: ['W', 'W', 'D', 'L', 'W'] },
  { id: 'team-02', name: 'Mersey City', shortName: 'MER', crest: '/images/teams/team-02.svg', country: 'England', leagueId: 'league-01', form: ['D', 'W', 'W', 'W', 'L'] },
  { id: 'team-03', name: 'North London FC', shortName: 'NLD', crest: '/images/teams/team-03.svg', country: 'England', leagueId: 'league-01', form: ['L', 'L', 'W', 'D', 'W'] },
  { id: 'team-04', name: 'West Midland Albion', shortName: 'WMA', crest: '/images/teams/team-04.svg', country: 'England', leagueId: 'league-01', form: ['W', 'L', 'W', 'L', 'D'] },
  { id: 'team-05', name: 'East London Rovers', shortName: 'ELR', crest: '/images/teams/team-05.svg', country: 'England', leagueId: 'league-01', form: ['D', 'D', 'L', 'W', 'W'] },

  // ===== Spanish-inspired (league-02) =====
  { id: 'team-06', name: 'Real Catalonia', shortName: 'RCT', crest: '/images/teams/team-06.svg', country: 'Spain', leagueId: 'league-02', form: ['W', 'W', 'W', 'D', 'W'] },
  { id: 'team-07', name: 'Atletico Madrid B', shortName: 'AMB', crest: '/images/teams/team-07.svg', country: 'Spain', leagueId: 'league-02', form: ['D', 'W', 'L', 'W', 'W'] },
  { id: 'team-08', name: 'Sevilla Sur', shortName: 'SVS', crest: '/images/teams/team-08.svg', country: 'Spain', leagueId: 'league-02', form: ['L', 'D', 'W', 'L', 'D'] },
  { id: 'team-09', name: 'Valencia Este', shortName: 'VLE', crest: '/images/teams/team-09.svg', country: 'Spain', leagueId: 'league-02', form: ['W', 'L', 'L', 'D', 'L'] },
  { id: 'team-10', name: 'Bilbao Norte', shortName: 'BLN', crest: '/images/teams/team-10.svg', country: 'Spain', leagueId: 'league-02', form: ['D', 'D', 'W', 'W', 'L'] },

  // ===== German-inspired (league-03) =====
  { id: 'team-11', name: 'FC Bayern Stadt', shortName: 'FBS', crest: '/images/teams/team-11.svg', country: 'Germany', leagueId: 'league-03', form: ['W', 'W', 'W', 'W', 'D'] },
  { id: 'team-12', name: 'Dortmund 09', shortName: 'D09', crest: '/images/teams/team-12.svg', country: 'Germany', leagueId: 'league-03', form: ['D', 'W', 'L', 'W', 'W'] },
  { id: 'team-13', name: 'RB Leipzig City', shortName: 'RBL', crest: '/images/teams/team-13.svg', country: 'Germany', leagueId: 'league-03', form: ['W', 'L', 'W', 'D', 'L'] },
  { id: 'team-14', name: 'Bayer Nordrhein', shortName: 'BNR', crest: '/images/teams/team-14.svg', country: 'Germany', leagueId: 'league-03', form: ['L', 'W', 'D', 'W', 'W'] },
  { id: 'team-15', name: 'Eintracht Frankfurt 09', shortName: 'EF9', crest: '/images/teams/team-15.svg', country: 'Germany', leagueId: 'league-03', form: ['D', 'L', 'W', 'L', 'D'] },

  // ===== Italian-inspired (league-04) =====
  { id: 'team-16', name: 'AC Milano Nord', shortName: 'AMN', crest: '/images/teams/team-16.svg', country: 'Italy', leagueId: 'league-04', form: ['W', 'D', 'W', 'W', 'W'] },
  { id: 'team-17', name: 'AS Roma Sud', shortName: 'ARS', crest: '/images/teams/team-17.svg', country: 'Italy', leagueId: 'league-04', form: ['D', 'W', 'L', 'D', 'W'] },
  { id: 'team-18', name: 'Juventus Torino', shortName: 'JVT', crest: '/images/teams/team-18.svg', country: 'Italy', leagueId: 'league-04', form: ['W', 'L', 'W', 'D', 'L'] },
  { id: 'team-19', name: 'Napoli Centro', shortName: 'NPC', crest: '/images/teams/team-19.svg', country: 'Italy', leagueId: 'league-04', form: ['L', 'W', 'L', 'W', 'D'] },
  { id: 'team-20', name: 'Inter Milano B', shortName: 'IMB', crest: '/images/teams/team-20.svg', country: 'Italy', leagueId: 'league-04', form: ['W', 'W', 'D', 'L', 'W'] },

  // ===== French-inspired (league-05) =====
  { id: 'team-21', name: 'Paris Saint-Germain B', shortName: 'PSB', crest: '/images/teams/team-21.svg', country: 'France', leagueId: 'league-05', form: ['W', 'W', 'W', 'L', 'W'] },
  { id: 'team-22', name: 'Olympique Lyon B', shortName: 'OLB', crest: '/images/teams/team-22.svg', country: 'France', leagueId: 'league-05', form: ['D', 'W', 'L', 'W', 'D'] },
  { id: 'team-23', name: 'AS Monaco B', shortName: 'ASM', crest: '/images/teams/team-23.svg', country: 'France', leagueId: 'league-05', form: ['W', 'L', 'D', 'W', 'L'] },
  { id: 'team-24', name: 'LOSC Lille B', shortName: 'LIL', crest: '/images/teams/team-24.svg', country: 'France', leagueId: 'league-05', form: ['L', 'D', 'W', 'D', 'W'] },
  { id: 'team-25', name: 'Stade Rennais B', shortName: 'SRB', crest: '/images/teams/team-25.svg', country: 'France', leagueId: 'league-05', form: ['D', 'L', 'L', 'W', 'L'] },

  // ===== Dutch-inspired (league-06) =====
  { id: 'team-26', name: 'Ajax Amsterdam B', shortName: 'AJA', crest: '/images/teams/team-26.svg', country: 'Netherlands', leagueId: 'league-06', form: ['W', 'W', 'D', 'W', 'W'] },
  { id: 'team-27', name: 'PSV Eindhoven B', shortName: 'PSV', crest: '/images/teams/team-27.svg', country: 'Netherlands', leagueId: 'league-06', form: ['W', 'D', 'W', 'L', 'W'] },
  { id: 'team-28', name: 'Feyenoord Rotterdam B', shortName: 'FEY', crest: '/images/teams/team-28.svg', country: 'Netherlands', leagueId: 'league-06', form: ['L', 'W', 'D', 'W', 'D'] },
  { id: 'team-29', name: 'AZ Alkmaar B', shortName: 'AZA', crest: '/images/teams/team-29.svg', country: 'Netherlands', leagueId: 'league-06', form: ['D', 'L', 'W', 'L', 'L'] },
  { id: 'team-30', name: 'FC Utrecht B', shortName: 'UTR', crest: '/images/teams/team-30.svg', country: 'Netherlands', leagueId: 'league-06', form: ['W', 'L', 'L', 'D', 'W'] },

  // ===== Portuguese-inspired (league-07) =====
  { id: 'team-31', name: 'SL Benfica B', shortName: 'BNF', crest: '/images/teams/team-31.svg', country: 'Portugal', leagueId: 'league-07', form: ['W', 'W', 'W', 'D', 'W'] },
  { id: 'team-32', name: 'FC Porto B', shortName: 'PRT', crest: '/images/teams/team-32.svg', country: 'Portugal', leagueId: 'league-07', form: ['D', 'W', 'W', 'L', 'W'] },
  { id: 'team-33', name: 'Sporting Lisbon B', shortName: 'SPL', crest: '/images/teams/team-33.svg', country: 'Portugal', leagueId: 'league-07', form: ['W', 'L', 'D', 'W', 'D'] },
  { id: 'team-34', name: 'SC Braga B', shortName: 'BRG', crest: '/images/teams/team-34.svg', country: 'Portugal', leagueId: 'league-07', form: ['L', 'D', 'L', 'W', 'L'] },
  { id: 'team-35', name: 'Vitoria Guimaraes B', shortName: 'VTG', crest: '/images/teams/team-35.svg', country: 'Portugal', leagueId: 'league-07', form: ['D', 'L', 'W', 'D', 'D'] },

  // ===== J1 League-inspired (league-08) =====
  { id: 'team-36', name: 'Tokyo Samurai', shortName: 'TKS', crest: '/images/teams/team-36.svg', country: 'Japan', leagueId: 'league-08', form: ['W', 'D', 'W', 'W', 'L'] },
  { id: 'team-37', name: 'Osaka Dragons', shortName: 'OSK', crest: '/images/teams/team-37.svg', country: 'Japan', leagueId: 'league-08', form: ['D', 'W', 'L', 'D', 'W'] },
  { id: 'team-38', name: 'Yokohama Typhoon', shortName: 'YKH', crest: '/images/teams/team-38.svg', country: 'Japan', leagueId: 'league-08', form: ['L', 'L', 'W', 'W', 'D'] },
  { id: 'team-39', name: 'Nagoya Phoenix', shortName: 'NGY', crest: '/images/teams/team-39.svg', country: 'Japan', leagueId: 'league-08', form: ['W', 'W', 'L', 'L', 'W'] },
  { id: 'team-40', name: 'Kobe Strikers', shortName: 'KBS', crest: '/images/teams/team-40.svg', country: 'Japan', leagueId: 'league-08', form: ['D', 'D', 'W', 'L', 'L'] },

  // ===== K League-inspired (league-09) =====
  { id: 'team-41', name: 'FC Seoul United', shortName: 'SEO', crest: '/images/teams/team-41.svg', country: 'South Korea', leagueId: 'league-09', form: ['W', 'W', 'D', 'W', 'W'] },
  { id: 'team-42', name: 'Busan Warriors', shortName: 'BSN', crest: '/images/teams/team-42.svg', country: 'South Korea', leagueId: 'league-09', form: ['D', 'L', 'W', 'D', 'L'] },
  { id: 'team-43', name: 'Jeonbuk Tigers', shortName: 'JNB', crest: '/images/teams/team-43.svg', country: 'South Korea', leagueId: 'league-09', form: ['L', 'W', 'L', 'W', 'W'] },
  { id: 'team-44', name: 'Ulsan Storm', shortName: 'ULS', crest: '/images/teams/team-44.svg', country: 'South Korea', leagueId: 'league-09', form: ['W', 'D', 'W', 'L', 'D'] },
  { id: 'team-45', name: 'Pohang Steelers B', shortName: 'PHG', crest: '/images/teams/team-45.svg', country: 'South Korea', leagueId: 'league-09', form: ['D', 'W', 'L', 'D', 'L'] },

  // ===== Thai League-inspired (league-10) =====
  { id: 'team-46', name: 'Bangkok United', shortName: 'BKK', crest: '/images/teams/team-46.svg', country: 'Thailand', leagueId: 'league-10', form: ['W', 'W', 'W', 'L', 'W'] },
  { id: 'team-47', name: 'Chonburi Sharks', shortName: 'CHB', crest: '/images/teams/team-47.svg', country: 'Thailand', leagueId: 'league-10', form: ['D', 'W', 'L', 'W', 'D'] },
  { id: 'team-48', name: 'Muang Thong Utd', shortName: 'MTU', crest: '/images/teams/team-48.svg', country: 'Thailand', leagueId: 'league-10', form: ['L', 'L', 'W', 'D', 'L'] },
  { id: 'team-49', name: 'Buriram United B', shortName: 'BRM', crest: '/images/teams/team-49.svg', country: 'Thailand', leagueId: 'league-10', form: ['W', 'D', 'D', 'W', 'W'] },
  { id: 'team-50', name: 'Port FC Bangkok', shortName: 'PFC', crest: '/images/teams/team-50.svg', country: 'Thailand', leagueId: 'league-10', form: ['D', 'L', 'W', 'L', 'D'] },

  // ===== V.League-inspired (league-11) =====
  { id: 'team-51', name: 'Hanoi FC', shortName: 'HAN', crest: '/images/teams/team-51.svg', country: 'Vietnam', leagueId: 'league-11', form: ['W', 'D', 'W', 'W', 'L'] },
  { id: 'team-52', name: 'Ho Chi Minh City FC', shortName: 'HCM', crest: '/images/teams/team-52.svg', country: 'Vietnam', leagueId: 'league-11', form: ['D', 'W', 'L', 'D', 'W'] },
  { id: 'team-53', name: 'Da Nang United', shortName: 'DNG', crest: '/images/teams/team-53.svg', country: 'Vietnam', leagueId: 'league-11', form: ['L', 'L', 'D', 'W', 'L'] },
  { id: 'team-54', name: 'Hai Phong FC', shortName: 'HPH', crest: '/images/teams/team-54.svg', country: 'Vietnam', leagueId: 'league-11', form: ['W', 'W', 'L', 'L', 'D'] },
  { id: 'team-55', name: 'Can Tho United', shortName: 'CTH', crest: '/images/teams/team-55.svg', country: 'Vietnam', leagueId: 'league-11', form: ['D', 'L', 'W', 'D', 'W'] },

  // ===== Chinese Super League-inspired (league-12) =====
  { id: 'team-56', name: 'Beijing Dynasty', shortName: 'BJD', crest: '/images/teams/team-56.svg', country: 'China', leagueId: 'league-12', form: ['W', 'W', 'W', 'D', 'W'] },
  { id: 'team-57', name: 'Shanghai Dragons', shortName: 'SHD', crest: '/images/teams/team-57.svg', country: 'China', leagueId: 'league-12', form: ['D', 'W', 'L', 'W', 'D'] },
  { id: 'team-58', name: 'Guangzhou Tigers', shortName: 'GZT', crest: '/images/teams/team-58.svg', country: 'China', leagueId: 'league-12', form: ['L', 'D', 'W', 'L', 'L'] },
  { id: 'team-59', name: 'Dalian Ocean', shortName: 'DLO', crest: '/images/teams/team-59.svg', country: 'China', leagueId: 'league-12', form: ['W', 'L', 'L', 'W', 'D'] },
  { id: 'team-60', name: 'Shenzhen Phoenix', shortName: 'SZP', crest: '/images/teams/team-60.svg', country: 'China', leagueId: 'league-12', form: ['D', 'W', 'D', 'L', 'W'] },
];
