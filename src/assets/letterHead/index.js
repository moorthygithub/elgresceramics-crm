
import AceBLetterhead from './AceB.png'
import AceGLetterhead from './AceG.png'
import ARBLetterhead from './ARB.png'
import ARKLetterhead from './ARK.png'
import ASILetterhead from './ASI.png'
import CapCLetterhead from './CapC.png'
import ISELetterhead from './ISE.png'
import NeBLetterhead from './NeB.png'
import NeWLetterhead from './NeW.png'
import NeWnLetterhead from './NeWn.png'
import OSLetterhead from './OS.png'
import RCEBLetterhead from './RCEB.png'
import RRELetterhead from './RRE.png'
import SCEBLetterhead from './SCEB.png'
import TSEBLetterhead from './TSEB.png'
import TSEKLetterhead from './TSEK.png'




export const letterheadImages = {
  'AceB.png': AceBLetterhead,
  'AceG.png': AceGLetterhead,
  'ARB.png': ARBLetterhead,
  'ARK.png': ARKLetterhead,
  'ASI.png': ASILetterhead,
  'CapC.png': CapCLetterhead,
  'ISE.png': ISELetterhead,
  'NeB.png': NeBLetterhead,
  'NeW.png': NeWLetterhead,
  'NeWn.png': NeWnLetterhead,
  'OS.png': OSLetterhead,
  'RCEB.png': RCEBLetterhead,
  'RRE.png': RRELetterhead,
  'SCEB.png': SCEBLetterhead,
  'TSEB.png': TSEBLetterhead,
  'TSEK.png': TSEKLetterhead,
  
};



export const  getLetterheadImage =(filename)=>{
    const image = letterheadImages[filename];
    if(!image){
        console.warn(`Letterhead image not found for Filename: ${filename}`)
        return letterheadImages['AceB.png']
    }
    return image
}