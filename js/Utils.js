class Utils{


    static randomPokemonNumber(){
    return(Math.floor(Math.random()*1025)+1);
    }

    static async  pokeAPI(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error('ERROR fetching data');
        return null;
    } else {
        return await response.json();
    }
}
}