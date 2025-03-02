package com.camyo.backend.camion;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.exceptions.ResourceNotFoundException;

@Service
public class CamionService {
    private final CamionRepository camionRepository;

    @Autowired
    public CamionService(CamionRepository camionRepository){
        this.camionRepository = camionRepository;
    }

    @Transactional(readOnly = true)
    public List<Camion> obtenerTodosCamiones(){
        return camionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Camion obtenerCamionPorId(Integer id){
        Optional<Camion> optCamion = camionRepository.findById(id);
        return optCamion.orElseThrow(
            () -> new ResourceNotFoundException("Camion", "Id", id));
    }
 
    @Transactional(readOnly = true)
    public List<Camion> obtenerCamionPorCamionero(Integer id){
        return camionRepository.obtenerCamionPorCamionero(id);
    }

    @Transactional
    public Camion guardarCamion(Camion camion){
        return camionRepository.save(camion);
    }

    @Transactional
    public Camion actualizaCamion(Integer id, Camion camionNuevo){
        Camion camionViejo = obtenerCamionPorId(id);
        BeanUtils.copyProperties(camionNuevo, camionViejo, "id", "usuario");
        return guardarCamion(camionViejo);
    }

    @Transactional
    public void eliminarCamion(Integer id){
        Camion c = obtenerCamionPorId(id);
        camionRepository.delete(c);
    }
    
}
