import { type BodyId, type BodyMetadata } from '../../solar-system/domain/body';

export type FocusedBodyFactRow = {
  label: string;
  value: string;
};

export type FocusedBodyFacts = {
  summaryParagraphs: string[];
  rows: FocusedBodyFactRow[];
};

const WIKIPEDIA_BODY_COPY: Record<BodyId, [string, string]> = {
  sun: [
    'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated by nuclear fusion in its core and radiating energy across the electromagnetic spectrum.',
    'Its gravity holds the planets, dwarf planets, comets, and small bodies in orbit. Solar magnetic activity produces sunspots, flares, and the solar wind, shaping space weather throughout the heliosphere.'
  ],
  mercury: [
    'Mercury is the innermost and smallest planet in the Solar System. It has a heavily cratered surface, almost no atmosphere, and the shortest orbital period of any planet.',
    'Its slow rotation and high orbital eccentricity create extreme temperature variation. The planet is rocky and dense, with a large metallic core that contributes to a weak global magnetic field.'
  ],
  venus: [
    'Venus is a rocky planet similar in size to Earth, but its dense carbon dioxide atmosphere and global cloud cover create the hottest surface conditions of any planet.',
    'It rotates slowly and in a retrograde direction. Volcanic plains, highland regions, and a reflective sulfuric-acid cloud layer make Venus both geologically distinctive and visually bright from Earth.'
  ],
  earth: [
    'Earth is the third planet from the Sun and the only astronomical object known to support life. Liquid surface water, active geology, and a nitrogen-oxygen atmosphere define its present environment.',
    'The planet has a differentiated interior, a protective magnetic field, and a dynamic climate system. Plate tectonics and the water cycle continually reshape its continents, oceans, and atmosphere.'
  ],
  moon: [
    'The Moon is Earth\'s only natural satellite and the fifth-largest moon in the Solar System. Its surface preserves dark volcanic maria, bright highlands, impact basins, and countless craters.',
    'The Moon is tidally locked, so the same hemisphere generally faces Earth. Its gravity drives ocean tides, and its surface records a long history of impacts and early Solar System evolution.'
  ],
  mars: [
    'Mars is a rocky planet with a thin carbon dioxide atmosphere, iron-oxide-rich surface materials, polar ice caps, volcanoes, canyons, and many preserved impact craters.',
    'Evidence from orbiters, landers, and rovers shows that liquid water once shaped parts of its surface. Today Mars is cold and dry, with dust storms and seasonal changes at the poles.'
  ],
  phobos: [
    'Phobos is the larger and innermost of Mars\' two moons. It is irregularly shaped, heavily cratered, and dominated by Stickney, a large impact crater that covers a substantial fraction of its surface.',
    'The moon orbits very close to Mars and gradually spirals inward because of tidal interactions. Its origin remains debated, with capture and impact-related formation both discussed in planetary science.'
  ],
  deimos: [
    'Deimos is the smaller and outer moon of Mars. It is irregular in shape, dark in color, and has a smoother appearance than Phobos because loose regolith partly fills many craters.',
    'Its orbit is farther from Mars and more slowly changing than Phobos. Like its companion moon, Deimos has an uncertain origin and may preserve clues about early Martian-system history.'
  ],
  jupiter: [
    'Jupiter is the largest planet in the Solar System, a gas giant composed mostly of hydrogen and helium. Its rapid rotation gives it a flattened shape and powerful atmospheric banding.',
    'The planet has a strong magnetic field, faint rings, and a large satellite system. The Great Red Spot and many smaller storms reveal a turbulent atmosphere with long-lived vortices.'
  ],
  io: [
    'Io is the innermost of the four Galilean moons and the most volcanically active body known in the Solar System. Its surface is continually resurfaced by eruptions and sulfur-rich deposits.',
    'Tidal heating from orbital interactions with Jupiter and neighboring moons drives its extreme geology. The result is a colorful landscape of volcanic plains, mountains, lava flows, and plume deposits.'
  ],
  europa: [
    'Europa is one of Jupiter\'s Galilean moons and has a bright, icy surface crossed by long cracks, ridges, and bands. It is slightly smaller than Earth\'s Moon.',
    'A global subsurface ocean is widely inferred beneath its ice shell, making Europa a major target in astrobiology. Its young-looking surface suggests ongoing or geologically recent activity.'
  ],
  ganymede: [
    'Ganymede is Jupiter\'s largest moon and the largest natural satellite in the Solar System. It is bigger than Mercury, though far less massive, and has a differentiated internal structure.',
    'Its surface mixes older dark terrain with younger grooved regions shaped by tectonic processes. Ganymede is also the only moon known to generate its own intrinsic magnetic field.'
  ],
  callisto: [
    'Callisto is the second-largest moon of Jupiter and one of the Galilean moons discovered in 1610. Its ancient surface is densely cratered and includes large multi-ring impact structures.',
    'The moon is thought to be only partially differentiated compared with Ganymede. A possible subsurface ocean, weak atmosphere, and low radiation environment have made it a recurring exploration interest.'
  ],
  saturn: [
    'Saturn is a gas giant and the second-largest planet in the Solar System. It is best known for its broad, bright ring system made mostly of countless icy particles.',
    'Its low average density, rapid rotation, and banded atmosphere distinguish it from the terrestrial planets. Saturn has many moons, including Titan, and a complex magnetosphere.'
  ],
  mimas: [
    'Mimas is a small icy moon of Saturn, notable for Herschel, an enormous impact crater that gives the moon a striking appearance in spacecraft images.',
    'Its low density indicates a composition dominated by water ice with some rock. Despite its size, Mimas has a complicated orbital relationship with Saturn\'s rings and neighboring moons.'
  ],
  enceladus: [
    'Enceladus is a bright icy moon of Saturn with a highly reflective surface. Cassini observations revealed active south-polar jets that eject water vapor and icy particles into space.',
    'Those plumes connect to a subsurface ocean beneath the ice shell and help supply material to Saturn\'s E ring. Enceladus is therefore a major target for ocean-world science.'
  ],
  tethys: [
    'Tethys is a mid-sized icy moon of Saturn with a very low density, indicating a body made mostly of water ice. Its bright surface is heavily cratered.',
    'The moon is marked by Odysseus, a large impact basin, and Ithaca Chasma, a vast system of troughs. These features point to intense impacts and internal stresses.'
  ],
  dione: [
    'Dione is an icy moon of Saturn with a surface divided between heavily cratered terrain and brighter wispy features. Those bright markings are systems of cliffs and fractures.',
    'The moon is denser than several neighboring Saturnian satellites, suggesting a larger rocky component. Cassini data also indicate interactions with Saturn\'s magnetosphere and possible internal activity.'
  ],
  rhea: [
    'Rhea is Saturn\'s second-largest moon and an icy body with a heavily cratered surface. It is composed mostly of water ice with a smaller rocky fraction.',
    'Its terrain includes bright wispy markings associated with fractures and cliffs. Rhea has been studied for signs of a tenuous atmosphere and possible ring-like debris, though rings were not confirmed.'
  ],
  titan: [
    'Titan is Saturn\'s largest moon and the only moon known to have a dense atmosphere. Its nitrogen-rich air contains organic haze that hides much of the surface in visible light.',
    'Radar and infrared observations reveal dunes, mountains, channels, lakes, and seas of liquid hydrocarbons. Titan also likely has a subsurface water ocean beneath its icy crust.'
  ],
  iapetus: [
    'Iapetus is a large outer moon of Saturn, famous for its dramatic two-tone coloration. One hemisphere is very dark, while the opposite side is much brighter.',
    'It also has a prominent equatorial ridge extending across much of the moon. Its low density suggests an icy composition, and its unusual surface has been studied since Cassini\'s observations.'
  ],
  uranus: [
    'Uranus is an ice giant with a pale blue-green color caused by methane in its atmosphere. It is unusual because its rotation axis is tilted almost onto its orbital plane.',
    'The planet has a ring system, a complex magnetic field, and many moons named largely from literary figures. Its atmosphere shows seasonal changes and high-altitude haze.'
  ],
  ariel: [
    'Ariel is one of the major moons of Uranus and among the brightest of them. Voyager 2 images show a surface with canyons, faults, and relatively young-looking terrain.',
    'Its density suggests a mixture of ice and rock. Some smooth plains and tectonic features may indicate past internal activity that modified older cratered landscapes.'
  ],
  umbriel: [
    'Umbriel is a dark major moon of Uranus with an old, heavily cratered surface. It reflects less light than the other large Uranian moons.',
    'Its largest bright-ringed feature, Wunda, stands out against otherwise subdued terrain. The moon is probably composed of roughly equal amounts of ice and rock.'
  ],
  titania: [
    'Titania is the largest moon of Uranus and the eighth-largest moon in the Solar System. Its surface is relatively dark, slightly reddish, and shaped by impacts and tectonic features.',
    'The moon likely contains roughly equal amounts of ice and rock, with possible internal differentiation. Large canyons and scarps may record expansion during its geological evolution.'
  ],
  oberon: [
    'Oberon is the outermost of Uranus\' five major moons and has a dark, heavily cratered surface. Some craters show bright ray systems and dark material on their floors.',
    'Its composition is probably a mixture of ice and rock. Voyager 2 provided the main close observations, revealing ancient terrain with signs of impact processing and possible internal change.'
  ],
  miranda: [
    'Miranda is the smallest and innermost of Uranus\' round major moons. It has an unusually varied surface, including large coronae, cliffs, ridges, valleys, and heavily cratered plains.',
    'Its complex geology may reflect past tidal heating, internal differentiation, or disruption and reassembly. The dramatic terrain makes Miranda one of the most distinctive Uranian satellites.'
  ],
  neptune: [
    'Neptune is the outermost known planet in the Solar System, an ice giant with a deep blue appearance. Methane contributes to its color, while high-speed winds shape its atmosphere.',
    'The planet has rings, storms, a strong magnetic field, and a varied satellite system. Its discovery followed mathematical predictions based on Uranus\' observed orbital motion.'
  ],
  triton: [
    'Triton is Neptune\'s largest moon and the only large moon in the Solar System with a retrograde orbit. It is thought to be a captured Kuiper belt object.',
    'Voyager 2 observed a young, icy surface with a south polar cap, cantaloupe terrain, and evidence of cryovolcanic plumes. Triton also has a thin nitrogen atmosphere.'
  ]
};

export function getFocusedBodyFacts(
  body: BodyMetadata | null | undefined
): FocusedBodyFacts | null {
  if (!body) {
    return null;
  }

  return {
    summaryParagraphs: WIKIPEDIA_BODY_COPY[body.id],
    rows: [
      {
        label: 'Radius',
        value: body.facts?.meanRadiusKm
          ? formatKilometers(body.facts.meanRadiusKm)
          : 'Not available'
      },
      {
        label: 'Gravity',
        value: body.facts?.approximateSurfaceGravityMps2
          ? `${formatDecimal(body.facts.approximateSurfaceGravityMps2, 2)} m/s^2`
          : 'Not available'
      },
      {
        label: 'Density',
        value: body.facts?.approximateBulkDensityKgPerM3
          ? `${formatDecimal(body.facts.approximateBulkDensityKgPerM3, 0)} kg/m^3`
          : 'Not available'
      },
      {
        label: 'Source',
        value: body.facts
          ? `Wikipedia description; ${body.facts.provenance}`
          : 'Wikipedia description; physical fields unavailable'
      }
    ]
  };
}

function formatKilometers(value: number) {
  const fractionDigits = value >= 100 ? 0 : 1;

  return `${formatDecimal(value, fractionDigits)} km`;
}

function formatDecimal(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits
  }).format(value);
}
