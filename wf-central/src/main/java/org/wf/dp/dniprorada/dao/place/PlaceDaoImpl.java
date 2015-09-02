package org.wf.dp.dniprorada.dao.place;

import org.hibernate.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.wf.dp.dniprorada.base.dao.GenericEntityDao;
import org.wf.dp.dniprorada.base.dao.util.QueryBuilder;
import org.wf.dp.dniprorada.dao.PlaceDao;
import org.wf.dp.dniprorada.model.Place;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.springframework.util.Assert.isTrue;
import static org.springframework.util.Assert.notNull;
import static org.wf.dp.dniprorada.dao.place.PlaceHibernateResultTransformer.toList;
import static org.wf.dp.dniprorada.dao.place.PlaceHibernateResultTransformer.toTree;

/**
 * @author dgroup
 * @since  20.07.2015
 */
@Repository
public class PlaceDaoImpl extends GenericEntityDao<Place> implements PlaceDao {
    private static final Logger LOG = LoggerFactory.getLogger(PlaceDaoImpl.class);

    @Autowired
    private PlaceQueryResolver placeQueryResolver;

    public PlaceDaoImpl() {
        super(Place.class);
    }


    @SuppressWarnings("unchecked")
    public PlaceHierarchyTree getTreeDown(PlaceHierarchyRecord root) {
        notNull(root, "Root element can't be a null");

        if (!valid(root.getPlaceId()) && isBlank(root.getUaID()))
            throw new IllegalArgumentException("PlaceId and UA id are empty");

        QueryBuilder sql = new QueryBuilder(getSession(), placeQueryResolver.getTreeDown(root))
            .append(root.isNotEmpty(), " where ");

        if (valid(root.getTypeId())) {
            sql.append(" (type_id = :TYPE_ID", root.getTypeId());

            if (valid(root.getPlaceId()))
                sql.append(" or id = :PLACE_ID)");

            else if (isNotBlank(root.getUaID()))
                sql.append(" or id = :UA_ID)");
        }

        sql .append( valid(root.isArea()) && valid(root.getTypeId()), " and ")
            .append( valid(root.isArea()), " area = :AREA", root.isArea() )
            .append( valid(root.isRoot()) && (valid(root.getTypeId()) ||valid(root.isArea()))," and ")
            .append( valid(root.isRoot()), " root = :ROOT", root.isRoot())
            .append( valid(root.getDeep()) && (
                     valid(root.getTypeId()) ||
                     valid(root.isArea()) ||
                     valid(root.isRoot()))," and ")
            .append( valid(root.getDeep()), " level <= :DEEP", root.getDeep())
            .setParam( valid(root.getPlaceId()), "PLACE_ID", root.getPlaceId())
            .setParam( !valid(root.getPlaceId()) && isNotBlank(root.getUaID()), "UA_ID", root.getUaID());

        LOG.warn("Query for execution: {}", sql);

        Query query = sql.toSQLQuery()
            .setResultTransformer(new PlaceHibernateResultTransformer());

        return valid(root.getTypeId())? toList(query.list()) : toTree(query.list());
    }


    @SuppressWarnings("unchecked")
    public PlaceHierarchyTree getTreeUp(Long placeId, String uaId, Boolean tree) {
        if (!valid(placeId) && isBlank(uaId)) {
            notNull(placeId, "PlaceId can't be empty");
            isTrue(isBlank(uaId), "UA id can't empty.");
        }

        String sql = placeQueryResolver.getTreeUp(placeId, uaId, tree);
        Query query = getSession()
            .createSQLQuery(sql)
            .setResultTransformer(new PlaceHibernateResultTransformer());

        if (valid(placeId))
            query.setLong("placeId", placeId);

        if (isNotBlank(uaId) && !valid(placeId))
            query.setString("ua_id", uaId);

        return toTree( query.list() );
    }

    static boolean valid(Long value) {
        return value != null && value > 0;
    }
    static boolean valid(Boolean value) {
        return value != null;
    }
}