import { Theme } from "@emotion/react";

const primary = {
  0: "#ED5E00",
  1: "#EF6E1A",
  2: "#F17E33",
  3: "#F28E4D",
  4: "#F49E66",
  5: "#F6AF80",
  6: "#F8BF99",
  7: "#FACFB3",
  8: "#FBDFCC",
  9: "#FDEFE6",
};

const primaryDark = {
  0: "#82300C",
};


const primaryLighter = {
  0: "#FFC26D",
};


const primaryBackgrouund = {
  0: "#FFFFFF",
};

const secondary = {
    0: "#FCB80E",
    1: "#FCBF26",
    2: "#FDC63E",
    3: "#FDCD56",
    4: "#FDD46E",
    5: "#FEDC87",
    6: "#FEE39F",
    7: "#FEEAB7",
    8: "#FEF1CF",
    9: "#FFF8E7",
}

const secondaryDark = {
  0: "#964B0A",
}
const secondaryLighter = {
    0: "#FFF287",
  }

  const gray = {
    0: "#666666",
    1: "#858585",
    2: "#A3A3A3",
    3: "#C2C2C2",
    4: "#E0E0E0",
    5: "#F0F0F0",
    6: "#F9F9F9",
    7: "#C5C8CC",
    8: "E6E6E6",
    9:"#CCCCCC"
}
const black = {
    0: "#000000",
  }
  const offBlack = {
    0: "#333333",
  }
  const white = {
    0: "#FFFFFF",
  }
  const offWhite = {
    0: "#F5F5F5",
    1:"#F4F4F4",
  }
  const link = {
    0: "#054CB8",
  }
  const linkVisited = {
    0: "#5305B8",
  }
  const yellow = {
    0: "#FDC500",
    9:"#FFFCF2"
  }
  const orange = {
    0: "#FD8C00",
  }
  const red = {
    0: "#B3261E",
    9:"#FCF1F1"
  }
  const green = {
    0: "#00AC46",
    1:"#3BA654",
    9:"#E7FBEF"
  }
  const maroon = {
    0: "#780000",
  }
  const blue = {
    0: "#3B82F6",
    9:"#F5F8FE",
  }
  
export const elevations: { [x: number]: string } = {
  0: "0px 0px 0px 0px rgba(0,0,0)",
  1: "0px 0px 10px -3px rgba(0,0,0,0.2)",
  2: "0px 0px 15px -3px rgba(0,0,0,0.3)",
  3: "0px 0px 15px -3px rgba(0,0,0,0.3);",
  4: "0px 0px 20px -3px rgba(0,0,0,0.3)",
  5: "0px 0px 25px -3px rgba(0,0,0,0.3)",
  6: "0px 0px 30px -2px rgba(0,0,0,0.3)",
  7: "0px 0px 40px 1px rgba(0,0,0,0.3)",
  8: "0px 0px 50px 2px rgba(0,0,0,0.3)",
  9: "0px 0px 60px 3px rgba(0,0,0,0.3)",
  10: "0px 0px 70px 5px rgba(0,0,0,0.3)",
  11:"0 4px 8px rgba(0, 0, 0, 0.1)",
  12:"0 4px 10px 0 rgba(0, 0, 0, 0.1)"
};
const size = {
"d1":144,
"d2":128,
"d3":96,
  "h1":72,
  "h2":64,
  "h3":48,
  "h4":40,
  "h5":32,
  "h6":24,
  "sub":20,
  "p":16,
  "ps":14,
  "pxs":12

}

const weight = {
  "small":200,
  "medium":400,
  "large":600,
  "Xlarge":700,
  "XXlarge":800,
  "xxxlarge":900,
}


declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: typeof primary;
      primaryLighter: typeof primaryLighter;
      primaryDark: typeof primaryDark;
      primaryBackgrouund: typeof primaryBackgrouund;
      secondary:typeof secondary
      secondaryDark: typeof secondaryDark;
      secondaryLighter: typeof secondaryLighter;
      black:typeof black;
      offBlack : typeof offBlack;
      white:typeof white;
      offWhite:typeof offWhite;
      link:typeof link;
      gray:typeof gray;
      yellow:typeof yellow;
      orange:typeof orange;
      red:typeof red;
      linkVisited:typeof linkVisited;
      green:typeof green;
      maroon:typeof maroon
      blue:typeof blue

    };
    gutter: number;
        typography:{
          size:{[x:string]:number}
          weight:{[x:string]:number};
        } ,
    elevations: { [x: number]: string };
  }
}

const theme: Theme = {
  colors: {
    primary,
    primaryLighter,
    primaryDark,
    primaryBackgrouund,
    secondary,
    secondaryDark,
    secondaryLighter,
    black,
    offBlack,
    gray,
    white,
    offWhite,
    link,
    linkVisited,
    yellow,
    orange,
    red,
    green,
    maroon,
    blue,
  },
  gutter:8,
  typography:{
    size,
    weight,
  } ,
elevations,
};

export default theme;



// declare module "@emotion/react" {
//   export interface Theme {
//     colors: {
//       primary:{},
//       secondary:string,
//       whiteA:string,
//       blackA:string,
//       redA:string,
//       blueA:string,
//       yellowA:string,
//       grayA:string,
//       orangeA:string,
//       signin:string,
//       green:string
//     };
//     typography: typeof size,
//     weight:{[x:string]:number};
//     gutter: number;
//     elevations: { [x: number]: string };
//   }
// }

// const theme: Theme = {
//   colors: {
//     primary:primary,
//     secondary:'#ED5E00',
//     whiteA:'#fff',
//     blackA:'#000',
//     redA:'#FF1919',
//     blueA:'#216DFF',
//     yellowA:'#FFC300',
//     grayA:'#4A4A4A',
//     orangeA:'#F97B22',
//     signin:"#472D2C",
//     green:'#008000'
//   },
//   weight,
//   gutter: 12,
//   elevations,
//   typography: size
// };

// export default theme;