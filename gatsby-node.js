const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'MarkdownRemark') {
    // We'll strip the date from the auto-generated slug
    const slug = createFilePath({ node, getNode, basePath: 'pages' });
    const [, slugSansDate] = slug.match(/\d\d\d-\d\d-\d\d-(.+)/);
    // MarkDownRemark nodes are either project posts or blog posts, to find out which
    // we can get the parentNode (a gatsby-source-filesystem node) and check its
    // sourceInstanceName (defined in gatsby-config.js)
    const postType = getNode(node.parent).sourceInstanceName;
    const finalSlug = `${postType}/${slugSansDate}`;

    createNodeField({
      node,
      name: 'slug',
      value: finalSlug,
    });
    createNodeField({
      node,
      name: 'postType',
      value: postType,
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve('./src/templates/project.js'),
          context: {
            slug: node.fields.slug,
          },
        });
      });
      resolve();
    });
  });
};
