package checkchow.back.admision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "facultad")
public class Facultad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 10, nullable = false)
    private String codigo;

    @Column(length = 150, nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private Boolean activo = true;

}