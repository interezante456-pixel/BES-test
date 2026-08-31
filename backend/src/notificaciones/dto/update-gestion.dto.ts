export class UpdateGestionDto {
  estadoGestion?: string;
  responsableId?: string | null;
  notasInternas?: string;
  fechaCompromiso?: string | null;
  comentario?: string;
}

export class CreateComentarioDto {
  texto: string;
}
