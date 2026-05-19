interface Player {
  playerId: string;
  name: string;
  teamId: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  number: number;
}

// Helper to generate players for a team
function teamPlayers(teamId: string, startNum: number, names: string[][]): Player[] {
  return names.map(([name, pos], i) => ({
    playerId: `player-${String(startNum + i).padStart(3, '0')}`,
    name,
    teamId,
    position: pos as 'GK' | 'DEF' | 'MID' | 'FWD',
    number: i + 1,
  }));
}

const allTeamPlayers: [string, string[][]][] = [
  // team-01 London United
  ['team-01', [
    ['Aaron Ramsdale Jr', 'GK'], ['Trent Williams', 'DEF'], ['Harry Maguire II', 'DEF'],
    ['Luke Shaw Jr', 'DEF'], ['Reece James II', 'DEF'], ['Declan Rice Jr', 'MID'],
    ['Mason Mount Jr', 'MID'], ['Phil Foden Jr', 'MID'], ['Marcus Rashford Jr', 'FWD'],
    ['Harry Kane Jr', 'FWD'], ['Bukayo Saka II', 'FWD'],
  ]],
  // team-02 Mersey City
  ['team-02', [
    ['Jordan Pickford II', 'GK'], ['Kyle Walker Jr', 'DEF'], ['John Stones II', 'DEF'],
    ['Ben Chilwell Jr', 'DEF'], ['Kieran Trippier II', 'DEF'], ['Jordan Henderson II', 'MID'],
    ['James Maddison Jr', 'MID'], ['Conor Gallagher II', 'MID'], ['Ollie Watkins II', 'FWD'],
    ['Ivan Toney Jr', 'FWD'], ['Raheem Sterling II', 'FWD'],
  ]],
  // team-03 North London FC
  ['team-03', [
    ['Nick Pope II', 'GK'], ['Aaron Wan-Bissaka Jr', 'DEF'], ['Ezri Konsa II', 'DEF'],
    ['Tyrick Mitchell II', 'DEF'], ['Trent Alexander-Arnold Jr', 'MID'], ['Kalvin Phillips II', 'MID'],
    ['Emile Smith Rowe II', 'MID'], ['Jack Grealish Jr', 'FWD'], ['Jarrod Bowen II', 'FWD'],
  ]],
  // team-04 West Midland Albion
  ['team-04', [
    ['Dean Henderson Jr', 'GK'], ['James Tarkowski II', 'DEF'], ['Max Kilman II', 'DEF'],
    ['Dan Burn Jr', 'DEF'], ['Rico Henry II', 'DEF'], ['Ruben Neves Jr', 'MID'],
    ['Bruno Guimaraes II', 'MID'], ['Joe Willock II', 'MID'], ['Callum Wilson II', 'FWD'],
    ['Alexander Isak Jr', 'FWD'], ['Miguel Almiron II', 'FWD'],
  ]],
  // team-05 East London Rovers
  ['team-05', [
    ['Alphonse Areola II', 'GK'], ['Vladimir Coufal Jr', 'DEF'], ['Nayef Aguerd II', 'DEF'],
    ['Kurt Zouma II', 'DEF'], ['Emerson Palmieri II', 'DEF'], ['Lucas Paqueta Jr', 'MID'],
    ['Tomas Soucek II', 'MID'], ['Jarrod Bowen Jr', 'MID'], ['Michail Antonio II', 'FWD'],
    ['Danny Ings II', 'FWD'], ['Said Benrahma Jr', 'FWD'],
  ]],
  // team-06 Real Catalonia
  ['team-06', [
    ['Marc-Andre ter Stegen Jr', 'GK'], ['Jules Kounde II', 'DEF'], ['Ronald Araujo II', 'DEF'],
    ['Alejandro Balde II', 'DEF'], ['Joao Cancelo Jr', 'DEF'], ['Pedri Gonzalez II', 'MID'],
    ['Gavi Fernandez II', 'MID'], ['Frenkie de Jong II', 'MID'], ['Robert Lewandowski Jr', 'FWD'],
    ['Lamine Yamal II', 'FWD'], ['Ferran Torres II', 'FWD'],
  ]],
  // team-07 Atletico Madrid B
  ['team-07', [
    ['Jan Oblak II', 'GK'], ['Jose Gimenez Jr', 'DEF'], ['Mario Hermoso II', 'DEF'],
    ['Nahuel Molina II', 'DEF'], ['Reinildo Mandava II', 'DEF'], ['Koke Resurreccion Jr', 'MID'],
    ['Rodrigo De Paul II', 'MID'], ['Marcos Llorente Jr', 'MID'], ['Antoine Griezmann Jr', 'FWD'],
    ['Alvaro Morata II', 'FWD'], ['Angel Correa II', 'FWD'],
  ]],
  // team-08 Sevilla Sur
  ['team-08', [
    ['Marco Dmitrovic Jr', 'GK'], ['Sergio Ramos Jr', 'DEF'], ['Diego Carlos II', 'DEF'],
    ['Marcos Acuna Jr', 'DEF'], ['Gonzalo Montiel II', 'DEF'], ['Ivan Rakitic Jr', 'MID'],
    ['Papu Gomez II', 'MID'], ['Joan Jordan II', 'MID'], ['Youssef En-Nesyri II', 'FWD'],
    ['Lucas Ocampos Jr', 'FWD'], ['Erik Lamela II', 'FWD'],
  ]],
  // team-09 Valencia Este
  ['team-09', [
    ['Giorgi Mamardashvili Jr', 'GK'], ['Mouctar Diakhaby II', 'DEF'], ['Gabriel Paulista II', 'DEF'],
    ['Jose Gaya II', 'DEF'], ['Thierry Correia Jr', 'DEF'], ['Carlos Soler Jr', 'MID'],
    ['Andre Almeida II', 'MID'], ['Yunus Musah II', 'MID'], ['Goncalo Guedes II', 'FWD'],
    ['Maxi Gomez Jr', 'FWD'], ['Hugo Duro II', 'FWD'],
  ]],
  // team-10 Bilbao Norte
  ['team-10', [
    ['Unai Simon II', 'GK'], ['Yeray Alvarez II', 'DEF'], ['Inigo Martinez Jr', 'DEF'],
    ['Oscar de Marcos Jr', 'DEF'], ['Yuri Berchiche II', 'DEF'], ['Iker Muniain Jr', 'MID'],
    ['Oihan Sancet II', 'MID'], ['Dani Garcia II', 'MID'], ['Inaki Williams II', 'FWD'],
    ['Nico Williams II', 'FWD'], ['Raul Garcia Jr', 'FWD'],
  ]],

  // team-11 to team-60 — fill remaining teams with 3-4 players each
  ['team-11', [['Manuel Neuer Jr', 'GK'], ['Matthijs de Ligt II', 'DEF'], ['Alphonso Davies II', 'DEF'], ['Joshua Kimmich Jr', 'MID'], ['Jamal Musiala II', 'MID'], ['Thomas Muller II', 'FWD'], ['Leroy Sane II', 'FWD'], ['Serge Gnabry II', 'FWD']]],
  ['team-12', [['Gregor Kobel II', 'GK'], ['Mats Hummels Jr', 'DEF'], ['Nico Schlotterbeck II', 'DEF'], ['Julian Brandt II', 'MID'], ['Marco Reus Jr', 'MID'], ['Karim Adeyemi II', 'FWD'], ['Donny Malen II', 'FWD']]],
  ['team-13', [['Peter Gulacsi II', 'GK'], ['Willi Orban Jr', 'DEF'], ['David Raum II', 'DEF'], ['Xavi Simons II', 'MID'], ['Dani Olmo Jr', 'MID'], ['Christopher Nkunku II', 'FWD'], ['Lois Openda II', 'FWD']]],
  ['team-14', [['Lukas Hradecky II', 'GK'], ['Jonathan Tah Jr', 'DEF'], ['Piero Hincapie II', 'DEF'], ['Florian Wirtz II', 'MID'], ['Jonas Hofmann II', 'MID'], ['Patrik Schick II', 'FWD'], ['Victor Boniface II', 'FWD']]],
  ['team-15', [['Kevin Trapp II', 'GK'], ['Robin Koch II', 'DEF'], ['Lucas Tuta Jr', 'DEF'], ['Mario Gotze Jr', 'MID'], ['Daichi Kamada II', 'MID'], ['Omar Marmoush II', 'FWD'], ['Randal Kolo Muani II', 'FWD']]],

  ['team-16', [['Mike Maignan II', 'GK'], ['Fikayo Tomori II', 'DEF'], ['Theo Hernandez II', 'DEF'], ['Sandro Tonali II', 'MID'], ['Rafael Leao II', 'FWD'], ['Olivier Giroud II', 'FWD'], ['Christian Pulisic II', 'FWD']]],
  ['team-17', [['Rui Patricio II', 'GK'], ['Chris Smalling II', 'DEF'], ['Leonardo Spinazzola II', 'DEF'], ['Lorenzo Pellegrini II', 'MID'], ['Paulo Dybala II', 'FWD'], ['Romelu Lukaku II', 'FWD'], ['Tammy Abraham II', 'FWD']]],
  ['team-18', [['Wojciech Szczesny II', 'GK'], ['Gleison Bremer II', 'DEF'], ['Federico Gatti II', 'DEF'], ['Manuel Locatelli II', 'MID'], ['Federico Chiesa II', 'FWD'], ['Dusan Vlahovic II', 'FWD'], ['Arkadiusz Milik II', 'FWD']]],
  ['team-19', [['Alex Meret II', 'GK'], ['Giovanni Di Lorenzo II', 'DEF'], ['Kim Min-Jae II', 'DEF'], ['Stanislav Lobotka II', 'MID'], ['Khvicha Kvaratskhelia II', 'FWD'], ['Victor Osimhen II', 'FWD'], ['Giacomo Raspadori II', 'FWD']]],
  ['team-20', [['Yann Sommer II', 'GK'], ['Alessandro Bastoni II', 'DEF'], ['Denzel Dumfries II', 'DEF'], ['Nicolo Barella II', 'MID'], ['Hakan Calhanoglu II', 'MID'], ['Lautaro Martinez II', 'FWD'], ['Marcus Thuram II', 'FWD']]],

  ['team-21', [['Gianluigi Donnarumma II', 'GK'], ['Marquinhos II', 'DEF'], ['Achraf Hakimi II', 'DEF'], ['Vitinha Ferreira II', 'MID'], ['Lee Kang-In II', 'MID'], ['Ousmane Dembele II', 'FWD'], ['Goncalo Ramos II', 'FWD']]],
  ['team-22', [['Anthony Lopes II', 'GK'], ['Dejan Lovren II', 'DEF'], ['Nicolas Tagliafico II', 'DEF'], ['Rayan Cherki II', 'MID'], ['Maxence Caqueret II', 'MID'], ['Alexandre Lacazette II', 'FWD'], ['Bradley Barcola II', 'FWD']]],
  ['team-23', [['Philipp Kohn II', 'GK'], ['Guillermo Maripan II', 'DEF'], ['Denis Zakaria II', 'MID'], ['Youssouf Fofana II', 'MID'], ['Takumi Minamino II', 'FWD'], ['Breel Embolo II', 'FWD'], ['Wissam Ben Yedder II', 'FWD']]],
  ['team-24', [['Lucas Chevalier II', 'GK'], ['Alexsandro Ribeiro II', 'DEF'], ['Benjamin Andre II', 'MID'], ['Nabil Bentaleb II', 'MID'], ['Hakon Haraldsson II', 'MID'], ['Jonathan David II', 'FWD'], ['Edon Zhegrova II', 'FWD']]],
  ['team-25', [['Steve Mandanda II', 'GK'], ['Warmed Omari II', 'DEF'], ['Adrien Truffert II', 'DEF'], ['Martin Terrier II', 'MID'], ['Amine Gouiri II', 'FWD'], ['Arnaud Kalimuendo II', 'FWD']]],

  ['team-26', [['Jay Gorter II', 'GK'], ['Jurrien Timber II', 'DEF'], ['Devyne Rensch II', 'DEF'], ['Steven Bergwijn II', 'MID'], ['Mohammed Kudus II', 'MID'], ['Brian Brobbey II', 'FWD'], ['Dusan Tadic II', 'FWD']]],
  ['team-27', [['Walter Benitez II', 'GK'], ['Andre Ramalho II', 'DEF'], ['Mauro Junior II', 'DEF'], ['Joey Veerman II', 'MID'], ['Johan Bakayoko II', 'MID'], ['Luuk de Jong II', 'FWD'], ['Hirving Lozano II', 'FWD']]],
  ['team-28', [['Justin Bijlow II', 'GK'], ['Lutsharel Geertruida II', 'DEF'], ['David Hancko II', 'DEF'], ['Quinten Timber II', 'MID'], ['Calvin Stengs II', 'MID'], ['Santiago Gimenez II', 'FWD'], ['Igor Paixao II', 'FWD']]],
  ['team-29', [['Mathew Ryan II', 'GK'], ['Bruno Martins Indi II', 'DEF'], ['Jordy Clasie II', 'MID'], ['Dani de Wit II', 'MID'], ['Vangelis Pavlidis II', 'FWD'], ['Jens Odgaard II', 'FWD']]],
  ['team-30', [['Vasilios Barkas II', 'GK'], ['Mike van der Hoorn II', 'DEF'], ['Can Bozdogan II', 'MID'], ['Jens Toornstra II', 'MID'], ['Sam Lammers II', 'FWD'], ['Othmane Boussaid II', 'FWD']]],

  ['team-31', [['Odysseas Vlachodimos II', 'GK'], ['Nicolas Otamendi II', 'DEF'], ['Alexander Bah II', 'DEF'], ['Joao Neves II', 'MID'], ['Angel Di Maria II', 'FWD'], ['Rafa Silva II', 'FWD'], ['Petar Musa II', 'FWD']]],
  ['team-32', [['Diogo Costa II', 'GK'], ['Pepe II', 'DEF'], ['Wendell Borges II', 'DEF'], ['Stephen Eustaquio II', 'MID'], ['Mehdi Taremi II', 'FWD'], ['Evanilson II', 'FWD'], ['Francisco Conceicao II', 'FWD']]],
  ['team-33', [['Antonio Adan II', 'GK'], ['Sebastian Coates II', 'DEF'], ['Goncalo Inacio II', 'DEF'], ['Hidemasa Morita II', 'MID'], ['Pedro Goncalves II', 'MID'], ['Viktor Gyokeres II', 'FWD'], ['Paulinho Fernandes II', 'FWD']]],
  ['team-34', [['Matheus Magalhaes II', 'GK'], ['Sikou Niakate II', 'DEF'], ['Ricardo Horta II', 'MID'], ['Al Musrati II', 'MID'], ['Simon Banza II', 'FWD'], ['Abel Ruiz II', 'FWD']]],
  ['team-35', [['Bruno Varela II', 'GK'], ['Toni Borevkovic II', 'DEF'], ['Andre Almeida II', 'MID'], ['Tiago Silva II', 'MID'], ['Jota Silva II', 'FWD'], ['Alisson Safira II', 'FWD']]],

  ['team-36', [['Kosei Tani II', 'GK'], ['Shogo Taniguchi II', 'DEF'], ['Kashif Bangnagande II', 'DEF'], ['Kuryu Matsuki II', 'MID'], ['Teruhito Nakagawa II', 'FWD'], ['Diego Oliveira II', 'FWD'], ['Yuma Suzuki II', 'FWD']]],
  ['team-37', [['Masaaki Higashiguchi II', 'GK'], ['Ryotaro Tsunoda II', 'DEF'], ['Riku Handa II', 'DEF'], ['Juan Alano II', 'MID'], ['Shinji Kagawa II', 'MID'], ['Takashi Usami II', 'FWD'], ['Shu Kurata II', 'FWD']]],
  ['team-38', [['Powell Obinna Obi II', 'GK'], ['Katsuya Nagato II', 'DEF'], ['Takumi Kamijima II', 'DEF'], ['Kota Mizunuma II', 'MID'], ['Anderson Lopes II', 'FWD'], ['Kenyu Sugimoto II', 'FWD'], ['Elber II', 'FWD']]],
  ['team-39', [['Mitchell Langerak II', 'GK'], ['Yuichi Maruyama II', 'DEF'], ['Haruya Fujii II', 'DEF'], ['Ryuji Izumi II', 'MID'], ['Mateus Castro II', 'FWD'], ['Kasper Junker II', 'FWD'], ['Noriyoshi Sakai II', 'FWD']]],
  ['team-40', [['Daiya Maekawa II', 'GK'], ['Takahiro Ogihara II', 'DEF'], ['Ryuta Koike II', 'DEF'], ['Tatsunori Sakurai II', 'MID'], ['Yoshinori Muto II', 'FWD'], ['Yuya Osako II', 'FWD'], ['Jean Patric II', 'FWD']]],

  ['team-41', [['Kim Seung-gyu II', 'GK'], ['Kim Young-gwon II', 'DEF'], ['Lee Ki-je II', 'DEF'], ['Paik Seung-ho II', 'MID'], ['Na Sang-ho II', 'FWD'], ['Stanislav Iljutcenko II', 'FWD'], ['Hwang Ui-jo II', 'FWD']]],
  ['team-42', [['Cho Hyun-woo II', 'GK'], ['Hong Jeong-ho II', 'DEF'], ['Kim Jin-su II', 'DEF'], ['Um Won-sang II', 'MID'], ['Kim Min-woo II', 'MID'], ['Gustavo Silva II', 'FWD'], ['Tiago Orobo II', 'FWD']]],
  ['team-43', [['Song Bum-keun II', 'GK'], ['Park Jin-seop II', 'DEF'], ['Hong Chul II', 'DEF'], ['Kim Bo-kyung II', 'MID'], ['Han Kyo-won II', 'FWD'], ['Moon Seon-min II', 'FWD'], ['Zeca II', 'FWD']]],
  ['team-44', [['Oh Seung-hoon II', 'GK'], ['Kim Kee-hee II', 'DEF'], ['Lee Myung-jae II', 'DEF'], ['Go Seung-beom II', 'MID'], ['Joo Min-kyu II', 'FWD'], ['Bakko II', 'FWD'], ['Martin Adam II', 'FWD']]],
  ['team-45', [['Hwang In-jae II', 'GK'], ['Alex Grant II', 'DEF'], ['Park Seung-wook II', 'DEF'], ['Oberdan II', 'MID'], ['Kim In-sung II', 'FWD'], ['Jeong Jae-hee II', 'FWD'], ['Zeca II', 'FWD']]],

  ['team-46', [['Kampol Pathom-attakul II', 'GK'], ['Suphan Thongsong II', 'DEF'], ['Piyaphon Phanichakul II', 'DEF'], ['Pokklaw Anan II', 'MID'], ['Heberty Fernandes II', 'FWD'], ['Adisak Kraisorn II', 'FWD'], ['Willen Mota II', 'FWD']]],
  ['team-47', [['Sinthaweechai Hathairattanakool II', 'GK'], ['Saringkan Promsupa II', 'DEF'], ['Kritsada Kaman II', 'DEF'], ['Worachit Kanitsribumphen II', 'MID'], ['Chayawat Srinawong II', 'FWD'], ['Danilo Alves II', 'FWD'], ['Yoo Byung-soo II', 'FWD']]],
  ['team-48', [['Kawin Thamsatchanan II', 'GK'], ['Tristan Do II', 'DEF'], ['Chatchai Saengdao II', 'DEF'], ['Weerathep Pomphan II', 'MID'], ['Poramet Arjvirai II', 'FWD'], ['Stefan Scepovic II', 'FWD'], ['Sardor Mirzaev II', 'FWD']]],
  ['team-49', [['Siwarak Tedsungnoen II', 'GK'], ['Pansa Hemviboon II', 'DEF'], ['Sasalak Haiprakon II', 'DEF'], ['Ratthanakorn Maikami II', 'MID'], ['Supachai Jaided II', 'FWD'], ['Lonsana Doumbouya II', 'FWD'], ['Haris Vuckic II', 'FWD']]],
  ['team-50', [['Sumethee Khokpho II', 'GK'], ['Elias Dolah II', 'DEF'], ['Suphanan Bureerat II', 'DEF'], ['Bordin Phala II', 'MID'], ['Teerasak Poeiphimai II', 'FWD'], ['Hamilton Soares II', 'FWD'], ['Tardeli Reis II', 'FWD']]],

  ['team-51', [['Nguyen Van Hoang II', 'GK'], ['Bui Hoang Viet Anh II', 'DEF'], ['Do Duy Manh II', 'DEF'], ['Nguyen Quang Hai II', 'MID'], ['Pham Tuan Hai II', 'FWD'], ['Nguyen Van Quyet II', 'FWD'], ['Rafaelson II', 'FWD']]],
  ['team-52', [['Bui Tien Dung II', 'GK'], ['Ho Tan Tai II', 'DEF'], ['Nguyen Thanh Chung II', 'DEF'], ['Nguyen Hoang Duc II', 'MID'], ['Rimario Gordon II', 'FWD'], ['Bruno Cantanhede II', 'FWD'], ['Geovane Magno II', 'FWD']]],
  ['team-53', [['Nguyen Tuan Manh II', 'GK'], ['Jhon Cley II', 'DEF'], ['Damir Memovic II', 'DEF'], ['Goran Causic II', 'MID'], ['Yago Ramos II', 'FWD'], ['Gastón Merlo II', 'FWD'], ['Akinade II', 'FWD']]],
  ['team-54', [['Nguyen Dinh Trieu II', 'GK'], ['Pham Hoang Lam II', 'DEF'], ['Le Van Dai II', 'DEF'], ['Joseph Mpande II', 'MID'], ['Nnamani Samuel II', 'FWD'], ['Douglas Coutinho II', 'FWD'], ['Washington Brandao II', 'FWD']]],
  ['team-55', [['Pham Van Tien II', 'GK'], ['Nguyen Van Thiet II', 'DEF'], ['Le Duc Luong II', 'DEF'], ['Mai Quoc Tu II', 'MID'], ['Luiz Henrique II', 'FWD'], ['Victor Nirennold II', 'FWD'], ['Jardel Capistrano II', 'FWD']]],

  ['team-56', [['Yan Junling II', 'GK'], ['Zhang Linpeng II', 'DEF'], ['Wu Lei II', 'FWD'], ['Oscar Emboaba II', 'MID'], ['Moises Lima II', 'MID'], ['Cephas Malele II', 'FWD'], ['Matias Vargas II', 'FWD']]],
  ['team-57', [['Wang Dalei II', 'GK'], ['Zheng Zheng II', 'DEF'], ['Jiang Guangtai II', 'DEF'], ['Cryzan II', 'FWD'], ['Marouane Fellaini II', 'MID'], ['Son Jun-ho II', 'MID'], ['Kuo Tian-yu II', 'FWD']]],
  ['team-58', [['Liu Dianzuo II', 'GK'], ['Jiang Zhipeng II', 'DEF'], ['Miao Tang II', 'DEF'], ['Frank Acheampong II', 'MID'], ['Yao Junsheng II', 'MID'], ['Nicolae Stanciu II', 'FWD'], ['Marcao II', 'FWD']]],
  ['team-59', [['Zhang Chong II', 'GK'], ['Zhu Ting II', 'DEF'], ['Li Shuai II', 'DEF'], ['Sun Ke II', 'MID'], ['Tsui Chun Lok II', 'MID'], ['Lucas Possignolo II', 'FWD'], ['Mozart II', 'FWD']]],
  ['team-60', [['Dong Chunyu II', 'GK'], ['Li Ang II', 'DEF'], ['Pei Shuai II', 'DEF'], ['Evrard Kouassi II', 'MID'], ['Andrigo Oliveira II', 'MID'], ['Richairo Zivkovic II', 'FWD'], ['Felicio Brown Forbes II', 'FWD']]],
];

const players: Player[] = [];
for (const [teamId, names] of allTeamPlayers) {
  const start = players.length + 1;
  players.push(...teamPlayers(teamId, start, names));
}

export { players };
export type { Player };
