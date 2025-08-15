Absolument ! Le nouveau système est parfaitement adapté pour ces types
  de scènes interactives. Voici comment les implémenter :

  💬 Scènes de dialogue avec PNJ

  "dialogue_tyrion_tavern": {
    metadata: {
      type: "dialogue",
      character: "Tyrion",
      location: "tavern"
    },
    content: {
      speaker: "Tyrion",
      portrait: "/images/portraits/tyrion.png",
      text: "Salut {playerName} ! Comment s'est passé ton voyage ?",
      variations: {
        firstMeeting: "Je suis Tyrion, guerrier de l'Ordre du Lion.",
        friendlyReputation: "Mon ami ! Content de te revoir !",
        hostile: "Tiens, tiens... qu'est-ce que tu fais ici ?"
      }
    },
    conditions: {
      show_variation: {
        firstMeeting: "!gameFlags.tyrionMet",
        friendlyReputation: "gameFlags.tyrionReputation >= 50",
        hostile: "gameFlags.tyrionReputation <= -20"
      }
    },
    choices: [
      {
        text: "Parle-moi de ta quête",
        next: "dialogue_tyrion_quest",
        condition: "gameFlags.tyrionMet"
      },
      {
        text: "Tu veux m'accompagner ?",
        next: "dialogue_tyrion_recruit",
        condition: "!gameFlags.companions.includes('Tyrion')"
      },
      {
        text: "Au revoir",
        next: "tavern_main"
      }
    ]
  }

  🖼️ Scènes avec image interactive

  "tavern_main": {
    metadata: {
      type: "interactive_scene",
      background: "/images/locations/tavern_interior.jpg",
      hotspots: true
    },
    content: {
      text: "Tu entres dans la taverne 'Le Dragon Endormi'. L'atmosphère      
  est chaleureuse...",
      description: "Une taverne typique avec un bar, des tables, un
  escalier vers les chambres..."
    },
    hotspots: [
      {
        id: "bar",
        coordinates: { x: 200, y: 150, width: 100, height: 80 },
        text: "Le comptoir du bar",
        action: { next: "tavern_bar" }
      },
      {
        id: "fireplace",
        coordinates: { x: 50, y: 200, width: 60, height: 100 },
        text: "Une cheminée crépitante",
        condition: "gameFlags.coldWeather",
        action: {
          type: "shortRest",
          nextScene: "tavern_main",
          message: "Tu te réchauffes près du feu..."
        }
      },
      {
        id: "stairs",
        coordinates: { x: 400, y: 100, width: 50, height: 120 },
        text: "Escalier vers les chambres",
        condition: "gameFlags.hasRoomKey || character.gold >= 5",
        action: { next: "tavern_upstairs" }
      },
      {
        id: "mysterious_stranger",
        coordinates: { x: 300, y: 250, width: 40, height: 60 },
        text: "Un étranger encapuchonné",
        condition: "gameFlags.questActive",
        action: { next: "dialogue_stranger" }
      }
    ],
    choices: [
      { text: "Sortir de la taverne", next: "town_square" }
    ]
  }

  🛒 Scène de marchand

  "merchant_aldric": {
    metadata: {
      type: "merchant",
      character: "Aldric",
      shop_type: "general_goods"
    },
    content: {
      speaker: "Aldric le Marchand",
      portrait: "/images/portraits/aldric.png",
      text: "Bienvenue dans ma boutique ! Que puis-je faire pour vous ?",     
      variations: {
        firstTime: "Ah, un nouveau client ! Jetez un œil à mes
  marchandises !",
        regularCustomer: "De retour ! J'ai reçu de nouveaux articles !",      
        vip: "Mon meilleur client ! J'ai quelque chose de spécial pour        
  vous..."
      }
    },
    shop: {
      currency: "gold",
      reputation_discount: {
        threshold: 75,
        discount: 0.9 // 10% de réduction
      },
      inventory: [
        {
          id: "potionOfHealing",
          price: 50,
          stock: 5,
          condition: "character.level >= 1"
        },
        {
          id: "potionOfSuperiorHealing",
          price: 150,
          stock: 2,
          condition: "character.level >= 5"
        },
        {
          id: "scrollOfFireball",
          price: 200,
          stock: 1,
          condition: "character.class === 'Magicien' && character.level       
  >= 5"
        },
        {
          id: "magicSword",
          price: 1000,
          stock: 1,
          condition: "gameFlags.aldricTrust >= 50",
          description: "Objet rare - nécessite la confiance du marchand"      
        }
      ],
      special_offers: [
        {
          condition: "gameFlags.completedGoblinQuest",
          message: "Merci de m'avoir débarrassé des gobelins ! Voici une      
  récompense.",
          reward: { type: "item", item: "potionOfHealing" }
        }
      ]
    },
    choices: [
      {
        text: "Acheter des objets",
        action: { type: "openShop" }
      },
      {
        text: "Vendre mes objets",
        action: { type: "openSellInterface" }
      },
      {
        text: "Parler d'autre chose",
        next: "dialogue_aldric_chat"
      },
      {
        text: "Au revoir",
        next: "town_square"
      }
    ]
  }

  🔧 Nouveaux composants nécessaires

  src/components/game/InteractiveScene.jsx

  const InteractiveScene = ({ scene, onHotspotClick }) => {
    return (
      <div className="interactive-scene">
        <div
          className="scene-background"
          style={{ backgroundImage: `url(${scene.metadata.background})`       
  }}
        >
          {scene.hotspots?.map(hotspot => (
            <div
              key={hotspot.id}
              className="hotspot"
              style={{
                left: hotspot.coordinates.x,
                top: hotspot.coordinates.y,
                width: hotspot.coordinates.width,
                height: hotspot.coordinates.height
              }}
              onClick={() => onHotspotClick(hotspot)}
              title={hotspot.text}
            />
          ))}
        </div>
        <div className="scene-description">
          {scene.content.text}
        </div>
      </div>
    );
  };

  src/components/game/DialogueScene.jsx

  const DialogueScene = ({ scene, character, onChoice }) => {
    return (
      <div className="dialogue-scene">
        <div className="dialogue-header">
          <img src={scene.content.portrait} alt={scene.content.speaker}       
  />
          <h3>{scene.content.speaker}</h3>
        </div>
        <div className="dialogue-text">
          {scene.content.text.replace('{playerName}', character.name)}        
        </div>
        <div className="dialogue-choices">
          {scene.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice)}
              className="dialogue-choice"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    );
  };

  src/components/game/MerchantScene.jsx

  const MerchantScene = ({ scene, character, onPurchase, onSell }) => {       
    const [shopMode, setShopMode] = useState('dialogue');

    return (
      <div className="merchant-scene">
        {shopMode === 'dialogue' && (
          <DialogueScene scene={scene} character={character} />
        )}
        {shopMode === 'shop' && (
          <ShopInterface
            inventory={scene.shop.inventory}
            character={character}
            onPurchase={onPurchase}
          />
        )}
      </div>
    );
  };

  🛠️ Extensions du StoryService

  export class StoryService {
    static renderInteractiveScene(scene, gameState) {
      // Filtrer les hotspots selon les conditions
      const availableHotspots = scene.hotspots?.filter(hotspot => {
        if (!hotspot.condition) return true;
        return this.evaluateCondition(hotspot.condition, gameState);
      });

      return { ...scene, hotspots: availableHotspots };
    }

    static processShopAction(action, character, merchant) {
      switch(action.type) {
        case 'purchase':
          return this.handlePurchase(action.itemId, character, merchant);     
        case 'sell':
          return this.handleSell(action.itemId, character, merchant);
        default:
          return null;
      }
    }
  }

  🎯 Avantages du système

  ✅ Flexibilité totale : Dialogue, exploration, commerce
  ✅ Conditions dynamiques : Contenu adaptatif
  ✅ Réutilisabilité : Templates pour marchands/PNJ
  ✅ Immersion : Images et interactions visuelles
  ✅ Évolutivité : Ajout facile de nouveaux types de scènes

  Ce système transforme ton RPG textuel en véritable jeu d'aventure
  interactif !