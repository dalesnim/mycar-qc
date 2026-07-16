import { ref } from "vue";
import type { Defect } from "./type";

export const defects = ref<Defect[]>([])

export const selectedId = ref<string | null>(null)

