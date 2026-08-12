import Rozet from './Rozet';
import { ASAMA_ADI, ASAMA_TONU } from '../utils/asama';

export default function AsamaRozeti({ asama }) {
    return <Rozet ton={ASAMA_TONU[asama]}>{ASAMA_ADI[asama]}</Rozet>;
}
