export type SolutionArchitecturePresenterPersona = "eva" | "alexander";

type PresenterTranscript = {
  role: "Interviewer" | "Tutor";
  transcript: string;
};

export const solutionArchitecturePresenterTranscripts: Record<
  number,
  Record<SolutionArchitecturePresenterPersona, PresenterTranscript>
> = {
  1: {
    eva: {
      role: "Interviewer",
      transcript: "Je bent gevraagd een digitale aanvraagoplossing te ontwerpen. De opdrachtgever zegt: ‘Jij bent de architect, dus bepaal maar of we volledig digitaal gaan.’ Wat neem jij als solution architect wél over, en wat juist niet? Denk niet alleen aan techniek. Maak expliciet wie het businessbesluit neemt, welke kaders al vaststaan en waar jouw ontwerpmandaat begint.",
    },
    alexander: {
      role: "Tutor",
      transcript: "De kern is rolzuiverheid. Een solution architect vertaalt een vastgestelde businessvraag en architectuurkaders naar een samenhangende oplossing. Je bepaalt bijvoorbeeld hoe systemen samenwerken en welke oplossingskeuzes nodig zijn. Je beslist niet zelfstandig dát de organisatie stopt met papier. En een lokale teamkeuze zonder landschapsimpact laat je bij het team. Goed ontwerpen begint dus met weten waar je mandaat ophoudt.",
    },
  },
  2: {
    eva: {
      role: "Interviewer",
      transcript: "‘Maak de aanvraag volledig digitaal.’ Klinkt duidelijk, maar is dat het ook? Betekent volledig digitaal alleen indienen, of ook keuring, besluit en status? En wat gebeurt er met iemand zonder DigiD? Formuleer vóór je ontwerpt welke vragen je teruglegt en welke aannames je zichtbaar maakt.",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een oplossingsrichting is nog geen heldere opdracht. Scheid daarom resultaat, scope, randvoorwaarden en aannames. Vraag wat ‘volledig’ betekent, wie de doelgroep is en welke uitzonderingen bestaan. Leg onbevestigde aannames vast als open punt. Zo voorkom je dat een impliciete veronderstelling stilletjes verandert in een technische afhankelijkheid. De architect maakt onzekerheid zichtbaar vóór die duur wordt.",
    },
  },
  3: {
    eva: {
      role: "Interviewer",
      transcript: "De gemeente wil actuele statusinformatie. Het klantcontactcentrum wil veel detail zien. De privacyfunctionaris wil juist minimale gegevensdeling. En een burger kan een aanvraag namens iemand anders doen. Wie mis je als je alleen naar de opdrachtgever kijkt? Benoem de belangen die werkelijk met elkaar botsen.",
    },
    alexander: {
      role: "Tutor",
      transcript: "Stakeholderanalyse is geen namenlijst. Je zoekt naar belangen, invloed en conflicten die ontwerpkeuzes sturen. Zet vervolgens wensen om in toetsbare eisen. ‘Snel’ is niet toetsbaar; ‘een volledige aanvraag krijgt binnen tien werkdagen een besluit’ wel. Als eisen elkaar uitsluiten, kies je niet stilletjes zelf. Je maakt de consequenties zichtbaar en legt de beslissing neer waar het mandaat ligt.",
    },
  },
  4: {
    eva: {
      role: "Interviewer",
      transcript: "Het portaal moet snel, veilig, gebruiksvriendelijk én vrijwel altijd beschikbaar zijn. Vier goede wensen — totdat ze elkaar raken. Een langere inlogsessie kan gebruiksgemak verbeteren en tegelijk het beveiligingsrisico verhogen. Welke kwaliteitseigenschappen sturen hier echt het ontwerp, en waar verwacht je een trade-off?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Kwaliteitsattributen worden pas bruikbaar als je ze koppelt aan context en meetbare grenzen. ‘Hoge beschikbaarheid’ zegt weinig; 99,9 procent binnen een afgesproken dienstperiode is toetsbaar. Prioriteer niet alles als hoogste. Kijk naar doelen, stakeholders en risico’s. Wanneer twee gewenste eigenschappen elkaar beïnvloeden, maak je de trade-off expliciet en toets je de keuze tegen de dominante kwaliteitsdoelen.",
    },
  },
  5: {
    eva: {
      role: "Interviewer",
      transcript: "De wethouder wil begrijpen welke partijen en verantwoordelijkheden betrokken zijn. Het deliveryteam wil technische grenzen en afhankelijkheden zien. Toon je beide groepen hetzelfde diagram? Welke informatie moet je weglaten om een model juist bruikbaarder te maken?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een architectuurmodel is geen doel op zichzelf. Kies een view op basis van de vraag en het publiek. C4 helpt je technisch van context naar container, component en eventueel code te zoomen. ArchiMate helpt relaties over meerdere architectuurlagen betekenisvol te presenteren. Gebruik ze niet als rivalen. De beste visualisatie bevat precies genoeg om de gewenste beslissing of discussie mogelijk te maken.",
    },
  },
  6: {
    eva: {
      role: "Interviewer",
      transcript: "Je vergelijkt twee alternatieven. Eén optie lijkt op álle relevante kwaliteitsattributen beter te scoren. Heb je dan een uitzonderlijk goede trade-off gevonden, of ontbreekt er iets in je analyse? En als je uiteindelijk kiest: welke nadelige consequenties moeten zichtbaar blijven in je besluit?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een echte trade-off betekent dat een keuze ergens wint en elders een prijs heeft. Als één alternatief aantoonbaar overal beter is, heb je waarschijnlijk geen dilemma maar een gegeven. Leg een besluit vast in een ADR: context, beslissing, alternatieven en consequenties. Consequenties zijn nadrukkelijk niet alleen voordelen. Juist de lasten en beperkingen maken later begrijpelijk waarom deze keuze destijds verdedigbaar was.",
    },
  },
  7: {
    eva: {
      role: "Interviewer",
      transcript: "Het burgerportaal heeft gegevens uit het zaaksysteem nodig en de keuringsinstantie levert enkele keren per dag een uitslag. Iemand stelt voor het portaal rechtstreeks op de database van het zaaksysteem aan te sluiten. Dat is snel. Maar welke afhankelijkheid koop je daarmee? En moet de keuringsuitslag worden bevraagd of juist als gebeurtenis worden ontvangen?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een koppeling is een afspraak tussen partijen en dus altijd beheerlast. Vermijd dat een afnemer afhankelijk wordt van interne databasestructuren die eigenlijk vrij moeten kunnen veranderen. Gebruik stabiele gepubliceerde interfaces waar dat past. Bij een uitslag die op een bepaald moment ontstaat en herleidbaar moet zijn, is gebeurtenisgedreven uitwisseling logisch — mits bevestiging, logging en foutafhandeling expliciet zijn ontworpen.",
    },
  },
  8: {
    eva: {
      role: "Interviewer",
      transcript: "Een ontwerp slaat een kopie van de keuringsuitslag op in het zaaksysteem, terwijl het architectuurprincipe zegt dat gegevens bij de bronhouder blijven tenzij dat aantoonbaar onwerkbaar is. Keur je het ontwerp direct af? Of kan een afwijking verdedigbaar zijn — en wat moet dan aantoonbaar worden gemaakt?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een principe geeft richting bij afwegingen; het is geen losse slogan en ook niet automatisch een absoluut verbod. Een afwijking kan verdedigbaar zijn als context, consequenties, eigenaar en termijn expliciet zijn. Een reviewopmerking als ‘zo doen wij dat niet’ is onvoldoende. Koppel het bezwaar aan een principe of eis, zodat het toetsbaar en weerlegbaar wordt. Governance maakt keuzes navolgbaar, niet bureaucratisch.",
    },
  },
  9: {
    eva: {
      role: "Interviewer",
      transcript: "Middelveen wil snelheid. Waarom niet gewoon digitale indiening, statusinzage en de keuringskoppeling in één weekend live zetten? Stel dat er maandag iets misgaat. Kun je dan nog aanwijzen welke wijziging de oorzaak is — en heb je een vooraf ontworpen weg terug?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Een doelarchitectuur wordt pas uitvoerbaar met tussenstappen die zelfstandig waarde leveren. Digitale indiening kan bijvoorbeeld eerst live terwijl de interne afhandeling nog gelijk blijft. Dat beperkt veranderomvang en maakt effecten beter observeerbaar. Ontwerp afhankelijkheden, go/no-go-criteria en rollback vooraf. Dubbeldraaien kost geld, maar kan rationeel zijn als die kosten lager zijn dan de schade van een mislukte overgang.",
    },
  },
  10: {
    eva: {
      role: "Interviewer",
      transcript: "Nu komt alles samen. De opdrachtgever noemt al een burgerportaal. Bestuur wil rijke actuele status, privacy vraagt begrenzing, delivery wil beheersbare afhankelijkheden en keuringsuitslagen moeten herleidbaar zijn. Neem niets automatisch over omdat het als oplossing is geformuleerd. Welke aannames toets je, welke kwaliteitsattributen domineren en welke keuze kun je straks echt verdedigen?",
    },
    alexander: {
      role: "Tutor",
      transcript: "Gebruik de hele redeneringsketen. Begin bij vraag, scope en aannames. Maak stakeholders en toetsbare eisen expliciet. Prioriteer kwaliteitsattributen. Kies views die de relevante beslissingen ondersteunen. Vergelijk alternatieven op consequenties, toets ze aan principes en leg het besluit vast. Ontwerp daarna een realiseerbare route met rollback. Een goede solution architecture is niet het mooiste diagram, maar een samenhangend en navolgbaar besluit dat ook uitvoerbaar blijft.",
    },
  },
};

export function getSolutionArchitecturePresenterTranscript(
  moduleId: number,
  persona: SolutionArchitecturePresenterPersona,
) {
  return solutionArchitecturePresenterTranscripts[moduleId]?.[persona] ?? null;
}
