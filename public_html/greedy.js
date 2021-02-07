// Solar Panel
var sp = {
  'name': "Solar Panel", 'eff': 40, 'cost': 24,
  'doStuff': function() {
    alert(this.name);
  }
};

// Wind
var wm = {
  'name': "Wind Turbine", 'eff': 90, 'cost': 12
};

// Hydro
var hy = {
  'name': "Hydroelectric Energy", 'eff': 60, 'cost': 10
};

// Biomass
var bi = {
  'name': "Biomass", 'eff': 45, 'cost': 14
};

// Natural Gas
var ng = {
  'name': "Natural Gas", 'eff': 40, 'cost': 10
};

// Coal
var co = {
  'name': "Coal", 'eff': 30, 'cost': 14
};

var sources = [sp, wm, hy, bi, ng, co];

function findBestOption(n)
{
    
    // n is my total unit money
    const money = n;
    var option = [];
    var result = [];
    var output = [];
    var i, j;
    for(i = 0; i < 6; i++)
    {
        var temp;
        temp = sources[i].eff / sources[i].cost;
        option[i] = temp;
    }
    option.sort(function(a,b){return b-a;});
    for(i = 0; i < 6; i++)
    {
        var temp;
        for(j = 0; j < 6; j++)
        {
            if( (sources[j].eff / sources[j].cost) == option[i] )
                temp = sources[j];
        }
        result[i] = temp;
    }
    for(i = 0; i < 6; i++)
    {
        if(result[i].cost < n)
        {
            output[i] = result[i];
            n = n - result[i].cost;
        }   
        else
            break;
    }
    var text = "";
    for(i = 0; i < output.length; i ++)
        text = text + output[i].name + "\n";
    text = text + "\nOptimal Energy Resources for " + money + " unit money.";
    swal(text);
    
    /*
    var i, j;
    arr.sort(function(a, b){return b-a;});
    var result = [];
    var slot = [false, false, false, false, false, false];
    for(i = 0; i < n; i++)
    {
        
    }
    */
    
    
}