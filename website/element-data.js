let elementData = new Map([['H', {"symbol":"H","atomicNumber":1,"atomicMass":1.007,"period":1,"group":1,"electronegativity":2.2,"firstIonization":13.5984,"covalentRadius":31,"atomicRadius":25,"valency":1,"lonePairs":0}],['He', {"symbol":"He","atomicNumber":2,"atomicMass":4.002,"period":1,"group":18,"electronegativity":0,"firstIonization":24.5874,"covalentRadius":28,"atomicRadius":120,"valency":0}],['Li', {"symbol":"Li","atomicNumber":3,"atomicMass":6.941,"period":2,"group":1,"electronegativity":0.98,"firstIonization":5.3917,"covalentRadius":128,"atomicRadius":145,"valency":0}],['Be', {"symbol":"Be","atomicNumber":4,"atomicMass":9.012,"period":2,"group":2,"electronegativity":1.57,"firstIonization":9.3227,"covalentRadius":96,"atomicRadius":105,"valency":0}],['B', {"symbol":"B","atomicNumber":5,"atomicMass":10.811,"period":2,"group":13,"electronegativity":2.04,"firstIonization":8.298,"covalentRadius":84,"atomicRadius":85,"valency":3,"lonePairs":1}],['C', {"symbol":"C","atomicNumber":6,"atomicMass":12.011,"period":2,"group":14,"electronegativity":2.55,"firstIonization":11.2603,"covalentRadius":76,"atomicRadius":70,"valency":4,"lonePairs":0}],['N', {"symbol":"N","atomicNumber":7,"atomicMass":14.007,"period":2,"group":15,"electronegativity":3.04,"firstIonization":14.5341,"covalentRadius":71,"atomicRadius":65,"valency":3,"lonePairs":1}],['O', {"symbol":"O","atomicNumber":8,"atomicMass":15.999,"period":2,"group":16,"electronegativity":3.44,"firstIonization":13.6181,"covalentRadius":66,"atomicRadius":60,"valency":2,"lonePairs":2}],['F', {"symbol":"F","atomicNumber":9,"atomicMass":18.998,"period":2,"group":17,"electronegativity":3.98,"firstIonization":17.4228,"covalentRadius":57,"atomicRadius":50,"valency":1,"lonePairs":3}],['Ne', {"symbol":"Ne","atomicNumber":10,"atomicMass":20.18,"period":2,"group":18,"electronegativity":0,"firstIonization":21.5645,"covalentRadius":58,"atomicRadius":160,"valency":0}],['Na', {"symbol":"Na","atomicNumber":11,"atomicMass":22.99,"period":3,"group":1,"electronegativity":0.93,"firstIonization":5.1391,"covalentRadius":166,"atomicRadius":180,"valency":0}],['Mg', {"symbol":"Mg","atomicNumber":12,"atomicMass":24.305,"period":3,"group":2,"electronegativity":1.31,"firstIonization":7.6462,"covalentRadius":141,"atomicRadius":150,"valency":0}],['Al', {"symbol":"Al","atomicNumber":13,"atomicMass":26.982,"period":3,"group":13,"electronegativity":1.61,"firstIonization":5.9858,"covalentRadius":121,"atomicRadius":125,"valency":0}],['Si', {"symbol":"Si","atomicNumber":14,"atomicMass":28.086,"period":3,"group":14,"electronegativity":1.9,"firstIonization":8.1517,"covalentRadius":111,"atomicRadius":110,"valency":4,"lonePairs":0}],['P', {"symbol":"P","atomicNumber":15,"atomicMass":30.974,"period":3,"group":15,"electronegativity":2.19,"firstIonization":10.4867,"covalentRadius":107,"atomicRadius":100,"valency":3,"lonePairs":1}],['S', {"symbol":"S","atomicNumber":16,"atomicMass":32.065,"period":3,"group":16,"electronegativity":2.58,"firstIonization":10.36,"covalentRadius":105,"atomicRadius":100,"valency":2,"lonePairs":2}],['Cl', {"symbol":"Cl","atomicNumber":17,"atomicMass":35.453,"period":3,"group":17,"electronegativity":3.16,"firstIonization":12.9676,"covalentRadius":102,"atomicRadius":100,"valency":1,"lonePairs":3}],['Ar', {"symbol":"Ar","atomicNumber":18,"atomicMass":39.948,"period":3,"group":18,"electronegativity":0,"firstIonization":15.7596,"covalentRadius":106,"atomicRadius":71,"valency":0}],['K', {"symbol":"K","atomicNumber":19,"atomicMass":39.098,"period":4,"group":1,"electronegativity":0.82,"firstIonization":4.3407,"covalentRadius":203,"atomicRadius":220,"valency":0}],['Ca', {"symbol":"Ca","atomicNumber":20,"atomicMass":40.078,"period":4,"group":2,"electronegativity":1,"firstIonization":6.1132,"covalentRadius":176,"atomicRadius":180,"valency":0}],['Sc', {"symbol":"Sc","atomicNumber":21,"atomicMass":44.956,"period":4,"group":3,"electronegativity":1.36,"firstIonization":6.5615,"covalentRadius":170,"atomicRadius":160,"valency":0}],['Ti', {"symbol":"Ti","atomicNumber":22,"atomicMass":47.867,"period":4,"group":4,"electronegativity":1.54,"firstIonization":6.8281,"covalentRadius":160,"atomicRadius":140,"valency":0}],['V', {"symbol":"V","atomicNumber":23,"atomicMass":50.942,"period":4,"group":5,"electronegativity":1.63,"firstIonization":6.7462,"covalentRadius":153,"atomicRadius":135,"valency":0}],['Cr', {"symbol":"Cr","atomicNumber":24,"atomicMass":51.996,"period":4,"group":6,"electronegativity":1.66,"firstIonization":6.7665,"covalentRadius":139,"atomicRadius":140,"valency":0}],['Mn', {"symbol":"Mn","atomicNumber":25,"atomicMass":54.938,"period":4,"group":7,"electronegativity":1.55,"firstIonization":7.434,"covalentRadius":139,"atomicRadius":140,"valency":0}],['Fe', {"symbol":"Fe","atomicNumber":26,"atomicMass":55.845,"period":4,"group":8,"electronegativity":1.83,"firstIonization":7.9024,"covalentRadius":132,"atomicRadius":140,"valency":0}],['Co', {"symbol":"Co","atomicNumber":27,"atomicMass":58.933,"period":4,"group":9,"electronegativity":1.88,"firstIonization":7.881,"covalentRadius":126,"atomicRadius":135,"valency":0}],['Ni', {"symbol":"Ni","atomicNumber":28,"atomicMass":58.693,"period":4,"group":10,"electronegativity":1.91,"firstIonization":7.6398,"covalentRadius":124,"atomicRadius":135,"valency":0}],['Cu', {"symbol":"Cu","atomicNumber":29,"atomicMass":63.546,"period":4,"group":11,"electronegativity":1.9,"firstIonization":7.7264,"covalentRadius":132,"atomicRadius":135,"valency":0}],['Zn', {"symbol":"Zn","atomicNumber":30,"atomicMass":65.38,"period":4,"group":12,"electronegativity":1.65,"firstIonization":9.3942,"covalentRadius":122,"atomicRadius":135,"valency":0}],['Ga', {"symbol":"Ga","atomicNumber":31,"atomicMass":69.723,"period":4,"group":13,"electronegativity":1.81,"firstIonization":5.9993,"covalentRadius":122,"atomicRadius":130,"valency":0}],['Ge', {"symbol":"Ge","atomicNumber":32,"atomicMass":72.64,"period":4,"group":14,"electronegativity":2.01,"firstIonization":7.8994,"covalentRadius":120,"atomicRadius":125,"valency":4,"lonePairs":0}],['As', {"symbol":"As","atomicNumber":33,"atomicMass":74.922,"period":4,"group":15,"electronegativity":2.18,"firstIonization":9.7886,"covalentRadius":119,"atomicRadius":115,"valency":3,"lonePairs":1}],['Se', {"symbol":"Se","atomicNumber":34,"atomicMass":78.96,"period":4,"group":16,"electronegativity":2.55,"firstIonization":9.7524,"covalentRadius":120,"atomicRadius":115,"valency":2,"lonePairs":2}],['Br', {"symbol":"Br","atomicNumber":35,"atomicMass":79.904,"period":4,"group":17,"electronegativity":2.96,"firstIonization":11.8138,"covalentRadius":120,"atomicRadius":115,"valency":1,"lonePairs":3}],['Kr', {"symbol":"Kr","atomicNumber":36,"atomicMass":83.798,"period":4,"group":18,"electronegativity":3,"firstIonization":13.9996,"covalentRadius":116,"atomicRadius":88,"valency":0}],['Rb', {"symbol":"Rb","atomicNumber":37,"atomicMass":85.468,"period":5,"group":1,"electronegativity":0.82,"firstIonization":4.1771,"covalentRadius":220,"atomicRadius":235,"valency":0}],['Sr', {"symbol":"Sr","atomicNumber":38,"atomicMass":87.62,"period":5,"group":2,"electronegativity":0.95,"firstIonization":5.6949,"covalentRadius":195,"atomicRadius":200,"valency":0}],['Y', {"symbol":"Y","atomicNumber":39,"atomicMass":88.906,"period":5,"group":3,"electronegativity":1.22,"firstIonization":6.2173,"covalentRadius":190,"atomicRadius":180,"valency":0}],['Zr', {"symbol":"Zr","atomicNumber":40,"atomicMass":91.224,"period":5,"group":4,"electronegativity":1.33,"firstIonization":6.6339,"covalentRadius":175,"atomicRadius":155,"valency":0}],['Nb', {"symbol":"Nb","atomicNumber":41,"atomicMass":92.906,"period":5,"group":5,"electronegativity":1.6,"firstIonization":6.7589,"covalentRadius":164,"atomicRadius":145,"valency":0}],['Mo', {"symbol":"Mo","atomicNumber":42,"atomicMass":95.96,"period":5,"group":6,"electronegativity":2.16,"firstIonization":7.0924,"covalentRadius":154,"atomicRadius":145,"valency":0}],['Tc', {"symbol":"Tc","atomicNumber":43,"atomicMass":98,"period":5,"group":7,"electronegativity":1.9,"firstIonization":7.28,"covalentRadius":147,"atomicRadius":135,"valency":0}],['Ru', {"symbol":"Ru","atomicNumber":44,"atomicMass":101.07,"period":5,"group":8,"electronegativity":2.2,"firstIonization":7.3605,"covalentRadius":146,"atomicRadius":130,"valency":0}],['Rh', {"symbol":"Rh","atomicNumber":45,"atomicMass":102.906,"period":5,"group":9,"electronegativity":2.28,"firstIonization":7.4589,"covalentRadius":142,"atomicRadius":135,"valency":0}],['Pd', {"symbol":"Pd","atomicNumber":46,"atomicMass":106.42,"period":5,"group":10,"electronegativity":2.2,"firstIonization":8.3369,"covalentRadius":139,"atomicRadius":140,"valency":0}],['Ag', {"symbol":"Ag","atomicNumber":47,"atomicMass":107.868,"period":5,"group":11,"electronegativity":1.93,"firstIonization":7.5762,"covalentRadius":145,"atomicRadius":160,"valency":0}],['Cd', {"symbol":"Cd","atomicNumber":48,"atomicMass":112.411,"period":5,"group":12,"electronegativity":1.69,"firstIonization":8.9938,"covalentRadius":144,"atomicRadius":155,"valency":0}],['In', {"symbol":"In","atomicNumber":49,"atomicMass":114.818,"period":5,"group":13,"electronegativity":1.78,"firstIonization":5.7864,"covalentRadius":142,"atomicRadius":155,"valency":0}],['Sn', {"symbol":"Sn","atomicNumber":50,"atomicMass":118.71,"period":5,"group":14,"electronegativity":1.96,"firstIonization":7.3439,"covalentRadius":139,"atomicRadius":145,"valency":0}],['Sb', {"symbol":"Sb","atomicNumber":51,"atomicMass":121.76,"period":5,"group":15,"electronegativity":2.05,"firstIonization":8.6084,"covalentRadius":139,"atomicRadius":145,"valency":3}],['Te', {"symbol":"Te","atomicNumber":52,"atomicMass":127.6,"period":5,"group":16,"electronegativity":2.1,"firstIonization":9.0096,"covalentRadius":138,"atomicRadius":140,"valency":2}],['I', {"symbol":"I","atomicNumber":53,"atomicMass":126.904,"period":5,"group":17,"electronegativity":2.66,"firstIonization":10.4513,"covalentRadius":139,"atomicRadius":140,"valency":1}],['Xe', {"symbol":"Xe","atomicNumber":54,"atomicMass":131.293,"period":5,"group":18,"electronegativity":2.6,"firstIonization":12.1298,"covalentRadius":140,"atomicRadius":108,"valency":0}],['Cs', {"symbol":"Cs","atomicNumber":55,"atomicMass":132.905,"period":6,"group":1,"electronegativity":0.79,"firstIonization":3.8939,"covalentRadius":244,"atomicRadius":260,"valency":0}],['Ba', {"symbol":"Ba","atomicNumber":56,"atomicMass":137.327,"period":6,"group":2,"electronegativity":0.89,"firstIonization":5.2117,"covalentRadius":215,"atomicRadius":215,"valency":0}],['La', {"symbol":"La","atomicNumber":57,"atomicMass":138.905,"period":6,"group":3,"electronegativity":1.1,"firstIonization":5.5769,"covalentRadius":207,"atomicRadius":195,"valency":0}],['Ce', {"symbol":"Ce","atomicNumber":58,"atomicMass":140.116,"period":6,"group":0,"electronegativity":1.12,"firstIonization":5.5387,"covalentRadius":204,"atomicRadius":185,"valency":0}],['Pr', {"symbol":"Pr","atomicNumber":59,"atomicMass":140.908,"period":6,"group":0,"electronegativity":1.13,"firstIonization":5.473,"covalentRadius":203,"atomicRadius":185,"valency":0}],['Nd', {"symbol":"Nd","atomicNumber":60,"atomicMass":144.242,"period":6,"group":0,"electronegativity":1.14,"firstIonization":5.525,"covalentRadius":201,"atomicRadius":185,"valency":0}],['Pm', {"symbol":"Pm","atomicNumber":61,"atomicMass":145,"period":6,"group":0,"electronegativity":1.13,"firstIonization":5.582,"covalentRadius":199,"atomicRadius":185,"valency":0}],['Sm', {"symbol":"Sm","atomicNumber":62,"atomicMass":150.36,"period":6,"group":0,"electronegativity":1.17,"firstIonization":5.6437,"covalentRadius":198,"atomicRadius":185,"valency":0}],['Eu', {"symbol":"Eu","atomicNumber":63,"atomicMass":151.964,"period":6,"group":0,"electronegativity":1.2,"firstIonization":5.6704,"covalentRadius":198,"atomicRadius":185,"valency":0}],['Gd', {"symbol":"Gd","atomicNumber":64,"atomicMass":157.25,"period":6,"group":0,"electronegativity":1.2,"firstIonization":6.1501,"covalentRadius":196,"atomicRadius":180,"valency":0}],['Tb', {"symbol":"Tb","atomicNumber":65,"atomicMass":158.925,"period":6,"group":0,"electronegativity":1.2,"firstIonization":5.8638,"covalentRadius":194,"atomicRadius":175,"valency":0}],['Dy', {"symbol":"Dy","atomicNumber":66,"atomicMass":162.5,"period":6,"group":0,"electronegativity":1.22,"firstIonization":5.9389,"covalentRadius":192,"atomicRadius":175,"valency":0}],['Ho', {"symbol":"Ho","atomicNumber":67,"atomicMass":164.93,"period":6,"group":0,"electronegativity":1.23,"firstIonization":6.0215,"covalentRadius":192,"atomicRadius":175,"valency":0}],['Er', {"symbol":"Er","atomicNumber":68,"atomicMass":167.259,"period":6,"group":0,"electronegativity":1.24,"firstIonization":6.1077,"covalentRadius":189,"atomicRadius":175,"valency":0}],['Tm', {"symbol":"Tm","atomicNumber":69,"atomicMass":168.934,"period":6,"group":0,"electronegativity":1.25,"firstIonization":6.1843,"covalentRadius":190,"atomicRadius":175,"valency":0}],['Yb', {"symbol":"Yb","atomicNumber":70,"atomicMass":173.054,"period":6,"group":0,"electronegativity":1.1,"firstIonization":6.2542,"covalentRadius":187,"atomicRadius":175,"valency":0}],['Lu', {"symbol":"Lu","atomicNumber":71,"atomicMass":174.967,"period":6,"group":0,"electronegativity":1.27,"firstIonization":5.4259,"covalentRadius":175,"atomicRadius":175,"valency":0}],['Hf', {"symbol":"Hf","atomicNumber":72,"atomicMass":178.49,"period":6,"group":4,"electronegativity":1.3,"firstIonization":6.8251,"covalentRadius":187,"atomicRadius":155,"valency":0}],['Ta', {"symbol":"Ta","atomicNumber":73,"atomicMass":180.948,"period":6,"group":5,"electronegativity":1.5,"firstIonization":7.5496,"covalentRadius":170,"atomicRadius":145,"valency":0}],['W', {"symbol":"W","atomicNumber":74,"atomicMass":183.84,"period":6,"group":6,"electronegativity":2.36,"firstIonization":7.864,"covalentRadius":162,"atomicRadius":135,"valency":0}],['Re', {"symbol":"Re","atomicNumber":75,"atomicMass":186.207,"period":6,"group":7,"electronegativity":1.9,"firstIonization":7.8335,"covalentRadius":151,"atomicRadius":135,"valency":0}],['Os', {"symbol":"Os","atomicNumber":76,"atomicMass":190.23,"period":6,"group":8,"electronegativity":2.2,"firstIonization":8.4382,"covalentRadius":144,"atomicRadius":130,"valency":0}],['Ir', {"symbol":"Ir","atomicNumber":77,"atomicMass":192.217,"period":6,"group":9,"electronegativity":2.2,"firstIonization":8.967,"covalentRadius":141,"atomicRadius":135,"valency":0}],['Pt', {"symbol":"Pt","atomicNumber":78,"atomicMass":195.084,"period":6,"group":10,"electronegativity":2.28,"firstIonization":8.9587,"covalentRadius":136,"atomicRadius":135,"valency":0}],['Au', {"symbol":"Au","atomicNumber":79,"atomicMass":196.967,"period":6,"group":11,"electronegativity":2.54,"firstIonization":9.2255,"covalentRadius":136,"atomicRadius":135,"valency":0}],['Hg', {"symbol":"Hg","atomicNumber":80,"atomicMass":200.59,"period":6,"group":12,"electronegativity":2,"firstIonization":10.4375,"covalentRadius":132,"atomicRadius":150,"valency":0}],['Tl', {"symbol":"Tl","atomicNumber":81,"atomicMass":204.383,"period":6,"group":13,"electronegativity":2.04,"firstIonization":6.1082,"covalentRadius":145,"atomicRadius":190,"valency":0}],['Pb', {"symbol":"Pb","atomicNumber":82,"atomicMass":207.2,"period":6,"group":14,"electronegativity":2.33,"firstIonization":7.4167,"covalentRadius":146,"atomicRadius":180,"valency":0}],['Bi', {"symbol":"Bi","atomicNumber":83,"atomicMass":208.98,"period":6,"group":15,"electronegativity":2.02,"firstIonization":7.2856,"covalentRadius":148,"atomicRadius":160,"valency":0}],['Po', {"symbol":"Po","atomicNumber":84,"atomicMass":210,"period":6,"group":16,"electronegativity":2,"firstIonization":8.417,"covalentRadius":140,"atomicRadius":190,"valency":0}],['At', {"symbol":"At","atomicNumber":85,"atomicMass":210,"period":6,"group":17,"electronegativity":2.2,"firstIonization":9.3,"covalentRadius":150,"atomicRadius":127,"valency":0}],['Rn', {"symbol":"Rn","atomicNumber":86,"atomicMass":222,"period":6,"group":18,"electronegativity":2.2,"firstIonization":10.7485,"covalentRadius":150,"atomicRadius":120,"valency":0}],['Fr', {"symbol":"Fr","atomicNumber":87,"atomicMass":223,"period":7,"group":1,"electronegativity":0.7,"firstIonization":4.0727,"covalentRadius":260,"atomicRadius":0,"valency":0}],['Ra', {"symbol":"Ra","atomicNumber":88,"atomicMass":226,"period":7,"group":2,"electronegativity":0.9,"firstIonization":5.2784,"covalentRadius":221,"atomicRadius":215,"valency":0}],['Ac', {"symbol":"Ac","atomicNumber":89,"atomicMass":227,"period":7,"group":3,"electronegativity":1.1,"firstIonization":5.17,"covalentRadius":215,"atomicRadius":195,"valency":0}],['Th', {"symbol":"Th","atomicNumber":90,"atomicMass":232.038,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.3067,"covalentRadius":206,"atomicRadius":180,"valency":0}],['Pa', {"symbol":"Pa","atomicNumber":91,"atomicMass":231.036,"period":7,"group":0,"electronegativity":1.5,"firstIonization":5.89,"covalentRadius":200,"atomicRadius":180,"valency":0}],['U', {"symbol":"U","atomicNumber":92,"atomicMass":238.029,"period":7,"group":0,"electronegativity":1.38,"firstIonization":6.1941,"covalentRadius":196,"atomicRadius":175,"valency":0}],['Np', {"symbol":"Np","atomicNumber":93,"atomicMass":237,"period":7,"group":0,"electronegativity":1.36,"firstIonization":6.2657,"covalentRadius":190,"atomicRadius":175,"valency":0}],['Pu', {"symbol":"Pu","atomicNumber":94,"atomicMass":244,"period":7,"group":0,"electronegativity":1.28,"firstIonization":6.0262,"covalentRadius":187,"atomicRadius":175,"valency":0}],['Am', {"symbol":"Am","atomicNumber":95,"atomicMass":243,"period":7,"group":0,"electronegativity":1.3,"firstIonization":5.9738,"covalentRadius":180,"atomicRadius":175,"valency":0}],['Cm', {"symbol":"Cm","atomicNumber":96,"atomicMass":247,"period":7,"group":0,"electronegativity":1.3,"firstIonization":5.9915,"covalentRadius":169,"atomicRadius":176,"valency":0}],['Bk', {"symbol":"Bk","atomicNumber":97,"atomicMass":247,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.1979,"covalentRadius":168,"atomicRadius":0,"valency":0}],['Cf', {"symbol":"Cf","atomicNumber":98,"atomicMass":251,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.2817,"covalentRadius":168,"atomicRadius":0,"valency":0}],['Es', {"symbol":"Es","atomicNumber":99,"atomicMass":252,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.42,"covalentRadius":165,"atomicRadius":0,"valency":0}],['Fm', {"symbol":"Fm","atomicNumber":100,"atomicMass":257,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.5,"covalentRadius":167,"atomicRadius":0,"valency":0}],['Md', {"symbol":"Md","atomicNumber":101,"atomicMass":258,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.58,"covalentRadius":173,"atomicRadius":0,"valency":0}],['No', {"symbol":"No","atomicNumber":102,"atomicMass":259,"period":7,"group":0,"electronegativity":1.3,"firstIonization":6.65,"covalentRadius":176,"atomicRadius":0,"valency":0}],['Lr', {"symbol":"Lr","atomicNumber":103,"atomicMass":262,"period":7,"group":0,"electronegativity":0,"firstIonization":0,"covalentRadius":161,"atomicRadius":0,"valency":0}],['Rf', {"symbol":"Rf","atomicNumber":104,"atomicMass":261,"period":7,"group":4,"electronegativity":0,"firstIonization":0,"covalentRadius":157,"atomicRadius":0,"valency":0}],['Db', {"symbol":"Db","atomicNumber":105,"atomicMass":262,"period":7,"group":5,"electronegativity":0,"firstIonization":0,"covalentRadius":149,"atomicRadius":0,"valency":0}],['Sg', {"symbol":"Sg","atomicNumber":106,"atomicMass":266,"period":7,"group":6,"electronegativity":0,"firstIonization":0,"covalentRadius":143,"atomicRadius":0,"valency":0}],['Bh', {"symbol":"Bh","atomicNumber":107,"atomicMass":264,"period":7,"group":7,"electronegativity":0,"firstIonization":0,"covalentRadius":141,"atomicRadius":0,"valency":0}],['Hs', {"symbol":"Hs","atomicNumber":108,"atomicMass":267,"period":7,"group":8,"electronegativity":0,"firstIonization":0,"covalentRadius":134,"atomicRadius":0,"valency":0}],['Mt', {"symbol":"Mt","atomicNumber":109,"atomicMass":268,"period":7,"group":9,"electronegativity":0,"firstIonization":0,"covalentRadius":129,"atomicRadius":0,"valency":0}],['Ds', {"symbol":"Ds","atomicNumber":110,"atomicMass":271,"period":7,"group":10,"electronegativity":0,"firstIonization":0,"covalentRadius":128,"atomicRadius":0,"valency":0}],['Rg', {"symbol":"Rg","atomicNumber":111,"atomicMass":272,"period":7,"group":11,"electronegativity":0,"firstIonization":0,"covalentRadius":121,"atomicRadius":0,"valency":0}],['Cn', {"symbol":"Cn","atomicNumber":112,"atomicMass":285,"period":7,"group":12,"electronegativity":0,"firstIonization":0,"covalentRadius":122,"atomicRadius":0,"valency":0}],['Nh', {"symbol":"Nh","atomicNumber":113,"atomicMass":284,"period":7,"group":13,"electronegativity":0,"firstIonization":0,"covalentRadius":136,"atomicRadius":0,"valency":0}],['Fl', {"symbol":"Fl","atomicNumber":114,"atomicMass":289,"period":7,"group":14,"electronegativity":0,"firstIonization":0,"covalentRadius":143,"atomicRadius":0,"valency":0}],['Mc', {"symbol":"Mc","atomicNumber":115,"atomicMass":288,"period":7,"group":15,"electronegativity":0,"firstIonization":0,"covalentRadius":162,"atomicRadius":0,"valency":0}],['Lv', {"symbol":"Lv","atomicNumber":116,"atomicMass":292,"period":7,"group":16,"electronegativity":0,"firstIonization":0,"covalentRadius":175,"atomicRadius":0,"valency":0}],['Ts', {"symbol":"Ts","atomicNumber":117,"atomicMass":295,"period":7,"group":17,"electronegativity":0,"firstIonization":0,"covalentRadius":165,"atomicRadius":0,"valency":0}],['Og', {"symbol":"Og","atomicNumber":118,"atomicMass":294,"period":7,"group":18,"electronegativity":0,"firstIonization":0,"covalentRadius":157,"atomicRadius":0,"valency":0}],])