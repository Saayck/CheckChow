package checkchow.back.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "omr_detalle", uniqueConstraints = @UniqueConstraint(columnNames = {"omr_respuesta_id", "nro_pregunta"}))
public class OmrDetalle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "omr_respuesta_id", nullable = false) private OmrRespuesta omrRespuesta;
    @Column(name = "nro_pregunta", nullable = false) private Integer nroPregunta;
    @Column private Character marca;
    @Column(name = "multi_marca", nullable = false) private Boolean multiMarca = false;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public OmrRespuesta getOmrRespuesta() { return omrRespuesta; } public void setOmrRespuesta(OmrRespuesta omrRespuesta) { this.omrRespuesta = omrRespuesta; }
    public Integer getNroPregunta() { return nroPregunta; } public void setNroPregunta(Integer nroPregunta) { this.nroPregunta = nroPregunta; }
    public Character getMarca() { return marca; } public void setMarca(Character marca) { this.marca = marca; }
    public Boolean getMultiMarca() { return multiMarca; } public void setMultiMarca(Boolean multiMarca) { this.multiMarca = multiMarca; }
}