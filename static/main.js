var col = {'population':'0', 'growth':'1', 'life':'2', 'birth':'3', 'death':'4', 'hiv':'5', 'energy':'6', 'gdp':'7'};

var map_selected_country = 'AFG';

function locator(name, country, year) {
    return '/data/' + col[name] + '&' + country + '&' + year ;
}

function unionChange(year) {
    scatterChange(year);
    pieChange(year);
}
