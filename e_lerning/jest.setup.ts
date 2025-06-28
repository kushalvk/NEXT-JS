// Define TextEncoder/TextDecoder BEFORE anything else
import { TextEncoder, TextDecoder } from 'util';
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;

import 'whatwg-fetch';