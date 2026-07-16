import { ref } from "vue";
import type { Defect } from "./type";

ref<Defect[]>([])

export const defects = ref <Defect[]>([])

export const selectedId = ref<string | null>(null)

