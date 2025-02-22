TODO:

1. Create a levelling system that interfaces with the player class and stores to db.
2. Create a status command to show your stats and interface with stuff like your inventory.
3. Create a narration class that takes in an array of text to choose between (optionally simple string) and the ability to send it with an interaction ephemerally or globally with a channel.
4. Create an item/resource system that players can manipulate with the /status command.
5. Create a manager class for interfacing with peoples inventory.
6. Create an environment system that have discord channels as an interface for communication. In these you can converse with others (like a normal discord channel.) All environments have their own channel attached and everyone inside an environment can only be inside one and thus cant see the others (using discord.js's member permissions system.)
7. Create a /travel command that allows the user to move to another environment that is adjacent (all environments have an array of adjacent environments stored, the /travel command cannot be used outside of the current environment channel and you cannot move to a non-adjacent space.)
8. Create a NPC system that allows the user to shop and interact, this uses the Narration class to converse with you.
9. Create an enemy system that allows you to fight them. Either with weapons (stored in inventory) or with your fist.
10. (maybe) Create a magic and skill system that uses the Vis system (Vis = Mana) to work.
11. Create a way to gain resources, trade them, ask, say, a blacksmith to craft a sword with resources.
12. Add a storyline that gets affected by all players
